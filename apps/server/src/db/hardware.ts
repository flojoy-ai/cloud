import { generateDatabaseId } from "@/lib/db-utils";
import {
  BadRequestError,
  DuplicateError,
  RouteError,
  InternalServerError,
  NotFoundError,
} from "@/lib/error";
import DB from "@/schemas/Database";
import { WorkspaceUser } from "@/schemas/public/WorkspaceUser";
import {
  Hardware,
  HardwareTree,
  HardwareWithModel,
  InsertHardware,
  SwapHardwareComponent,
} from "@/types/hardware";
import { ExpressionBuilder, Kysely } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import _ from "lodash";
import { User } from "lucia";
import { fromPromise } from "neverthrow";
import { db } from "./kysely";
import { getModel, getModelComponents } from "./model";
import { markUpdatedAt } from "./query";

export async function getHardware(id: string) {
  return await db
    .selectFrom("hardware")
    .selectAll()
    .where("hardware.id", "=", id)
    .executeTakeFirst();
}

export async function createHardware(
  db: Kysely<DB>,
  workspaceId: string,
  user: User,
  hardware: InsertHardware,
) {
  // TODO: Not working for now
  return fromPromise(
    db.transaction().execute(async (tx) => {
      const { components, projectId, ...newHardware } = hardware;

      const model = await getModel(hardware.modelId);
      if (!model) {
        throw new NotFoundError("Model not found");
      }

      const created = await tx
        .insertInto("hardware")
        .values({
          id: generateDatabaseId("hardware"),
          workspaceId,
          ...newHardware,
        })
        .returningAll()
        .executeTakeFirst();
      if (created === undefined) {
        throw new InternalServerError("Failed to create hardware");
      }

      const modelComponents = await getModelComponents(model.id);

      if (modelComponents.length > 0) {
        const ids = components;
        if (_.uniq(ids).length !== ids.length) {
          throw new BadRequestError("Duplicate hardware devices");
        }

        const hardwares = await db
          .selectFrom("hardware")
          .selectAll("hardware")
          .where("hardware.id", "in", ids)
          .where(notInUse)
          .execute();

        if (hardwares.length !== components.length) {
          throw new DuplicateError("Some hardware devices are already in use!");
        }

        const modelCount = _.countBy(hardwares, (h) => h.modelId);
        const matches = _.every(
          modelComponents,
          (c) => modelCount[c.modelId] === c.count,
        );

        if (!matches) {
          throw new BadRequestError(
            "Components do not satisfy model requirements",
          );
        }

        await tx
          .insertInto("hardware_relation")
          .values(
            components.map((c) => ({
              parentHardwareId: created.id,
              childHardwareId: c,
            })),
          )
          .execute();

        await tx
          .insertInto("hardware_revision")
          .values(
            components.map((c) => ({
              hardwareId: created.id,
              revisionType: "init",
              componentId: c,
              reason: "Initial hardware creation",
              userId: user.id,
            })),
          )
          .execute();
      }

      if (projectId !== undefined) {
        await tx
          .insertInto("project_hardware")
          .values({
            hardwareId: created.id,
            projectId,
          })
          .execute();
      }

      await markUpdatedAt(tx, "workspace", workspaceId);

      return created;
    }),
    (e) => e as RouteError,
  );
}

export async function getHardwareRevisions(hardwareId: string) {
  return await db
    .selectFrom("hardware_revision as hr")
    .selectAll("hr")
    .innerJoin("hardware", "hardware.id", "hr.componentId")
    .innerJoin("user", "user.id", "hr.userId")
    .select("hardware.name as componentName")
    .select("user.email as userEmail")
    .where("hr.hardwareId", "=", hardwareId)
    .orderBy("hr.createdAt", "desc")
    .execute();
}

export async function doHardwareComponentSwap(
  hardware: Hardware,
  user: WorkspaceUser,
  input: SwapHardwareComponent,
) {
  const hardwareComponents = await getHardwareComponentsWithModel(hardware.id);

  return fromPromise(
    db.transaction().execute(async (tx) => {
      const oldHardwareComponent = await tx
        .selectFrom("hardware")
        .selectAll()
        .where("hardware.id", "=", input.oldHardwareComponentId)
        .where("hardware.workspaceId", "=", user.workspaceId)
        .executeTakeFirstOrThrow(
          () => new NotFoundError("Old component not found"),
        );

      const newHardwareComponent = await tx
        .selectFrom("hardware")
        .selectAll()
        .where("hardware.id", "=", input.newHardwareComponentId)
        .where("hardware.workspaceId", "=", user.workspaceId)
        .executeTakeFirstOrThrow(
          () => new NotFoundError("New component not found"),
        );

      if (oldHardwareComponent.modelId !== newHardwareComponent.modelId) {
        throw new BadRequestError("Model mismatch");
      }

      if (
        !hardwareComponents.some(
          (hc) => hc.hardwareId === input.oldHardwareComponentId,
        )
      ) {
        throw new BadRequestError(
          "Old component is not a part of the hardware",
        );
      }

      await tx
        .deleteFrom("hardware_relation as hr")
        .where("hr.parentHardwareId", "=", hardware.id)
        .where("hr.childHardwareId", "=", input.oldHardwareComponentId)
        .execute();

      await tx
        .insertInto("hardware_relation")
        .values({
          parentHardwareId: hardware.id,
          childHardwareId: input.newHardwareComponentId,
        })
        .execute();

      await tx
        .insertInto("hardware_revision")
        .values([
          {
            revisionType: "remove",
            userId: user.userId,
            hardwareId: hardware.id,
            componentId: input.oldHardwareComponentId,
            reason: input.reason ?? "Component swap",
          },
          {
            revisionType: "add",
            userId: user.userId,
            hardwareId: hardware.id,
            componentId: input.newHardwareComponentId,
            reason: input.reason ?? "Component swap",
          },
        ])
        .execute();
    }),
    (e) => e as RouteError,
  );
}

export const notInUse = ({
  not,
  exists,
  selectFrom,
}: ExpressionBuilder<DB, "hardware">) => {
  return not(
    exists(
      selectFrom("hardware_relation as hr")
        .selectAll()
        .whereRef("hr.childHardwareId", "=", "hardware.id"),
    ),
  );
};

export function withHardwareModel(eb: ExpressionBuilder<DB, "hardware">) {
  return jsonObjectFrom(
    eb
      .selectFrom("model")
      .selectAll("model")
      .whereRef("model.id", "=", "hardware.modelId"),
  ).as("model");
}

export async function getHardwareTree(
  hardware: HardwareWithModel,
): Promise<HardwareTree> {
  const edges = await db
    .withRecursive("hardware_tree", (qb) =>
      qb
        .selectFrom("hardware_relation as hr")
        .innerJoin("hardware", "hr.childHardwareId", "hardware.id")
        .innerJoin("model", "hardware.modelId", "model.id")
        .select([
          "parentHardwareId",
          "childHardwareId as hardwareId",
          "hardware.name as name",
          "hardware.modelId as modelId",
          "model.name as modelName",
        ])
        .where("parentHardwareId", "=", hardware.id)
        .unionAll((eb) =>
          eb
            .selectFrom("hardware_relation as hr")
            .innerJoin("hardware", "hr.childHardwareId", "hardware.id")
            .innerJoin(
              "hardware_tree",
              "hardware_tree.hardwareId",
              "hr.parentHardwareId",
            )
            .innerJoin("model", "hardware.modelId", "model.id")
            .select([
              "hr.parentHardwareId",
              "hr.childHardwareId as hardwareId",
              "hardware.name as name",
              "hardware.modelId as modelId",
              "model.name as modelName",
            ]),
        ),
    )
    .selectFrom("hardware_tree")
    .selectAll()
    .execute();

  return buildHardwareTree(hardware, edges);
}

type HardwareEdge = {
  name: string;
  hardwareId: string;
  parentHardwareId: string;
  modelId: string;
  modelName: string;
};

export function buildHardwareTree(
  root: HardwareWithModel,
  edges: HardwareEdge[],
) {
  const nodes = new Map<string, HardwareTree>();
  nodes.set(root.id, { ...root, modelName: root.model.name, components: [] });

  for (const edge of edges) {
    const parent = nodes.get(edge.parentHardwareId);
    if (!parent) {
      throw new Error("Shouldn't happen");
    }
    let cur = nodes.get(edge.hardwareId);

    if (!cur) {
      cur = {
        id: edge.hardwareId,
        name: edge.name,
        modelId: edge.modelId,
        modelName: edge.modelName,
        components: [],
      };
      nodes.set(edge.hardwareId, cur);
    }

    parent.components.push(cur);
  }

  return nodes.get(root.id)!;
}

export async function getHardwareComponentsWithModel(id: string) {
  return await db
    .selectFrom("hardware_relation as hr")
    .innerJoin("hardware", "hardware.id", "hr.childHardwareId")
    .innerJoin("model", "model.id", "hardware.modelId")
    .select(["hr.childHardwareId as hardwareId", "model.id as modelId"])
    .where("hr.parentHardwareId", "=", id)
    .execute();
}
