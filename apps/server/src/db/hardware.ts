import { generateDatabaseId } from "../lib/db-utils";
import {
  BadRequestError,
  DuplicateError,
  RouteError,
  InternalServerError,
  NotFoundError,
} from "../lib/error";
import {
  DB,
  WorkspaceUser,
  Hardware,
  HardwareTreeNode,
  HardwareTreeRoot,
  InsertHardware,
  SwapHardwareComponent,
} from "@cloud/shared";
import { ExpressionBuilder, Kysely } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import _ from "lodash";
import { User } from "lucia";
import { fromPromise } from "neverthrow";
import { db } from "./kysely";
import { getPartVariation, getPartVariationComponents } from "./part-variation";
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
  return fromPromise(
    db.transaction().execute(async (tx) => {
      const { components, projectId, ...newHardware } = hardware;

      const partVariation = await getPartVariation(hardware.partVariationId);
      if (!partVariation) {
        throw new NotFoundError("PartVariation not found");
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

      const partVariationComponents = await getPartVariationComponents(
        partVariation.id,
      );

      if (partVariationComponents.length > 0) {
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

        const partVariationCount = _.countBy(
          hardwares,
          (h) => h.partVariationId,
        );
        const matches = _.every(
          partVariationComponents,
          (c) => partVariationCount[c.partVariationId] === c.count,
        );

        if (!matches) {
          throw new BadRequestError(
            "Components do not satisfy partVariation requirements",
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
    .select("hardware.serialNumber as componentSerialNumber")
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
  const hardwareComponents = await getHardwareComponentsWithPartVariation(
    hardware.id,
  );

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

      if (
        oldHardwareComponent.partVariationId !==
        newHardwareComponent.partVariationId
      ) {
        throw new BadRequestError("PartVariation mismatch");
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

export function withHardwarePartVariation(
  eb: ExpressionBuilder<DB, "hardware">,
) {
  return jsonObjectFrom(
    eb
      .selectFrom("part_variation")
      .selectAll("part_variation")
      .whereRef("part_variation.id", "=", "hardware.partVariationId"),
  ).as("partVariation");
}

export async function getHardwareTree(
  hardware: Omit<HardwareTreeRoot, "components">,
): Promise<HardwareTreeRoot> {
  const edges = await db
    .withRecursive("hardware_tree", (qb) =>
      qb
        .selectFrom("hardware_relation as hr")
        .innerJoin("hardware", "hr.childHardwareId", "hardware.id")
        .innerJoin(
          "part_variation",
          "hardware.partVariationId",
          "part_variation.id",
        )
        .select([
          "parentHardwareId",
          "childHardwareId as hardwareId",
          "hardware.serialNumber as serialNumber",
          "hardware.partVariationId as partVariationId",
          "part_variation.partNumber as partNumber",
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
            .innerJoin(
              "part_variation",
              "hardware.partVariationId",
              "part_variation.id",
            )
            .select([
              "hr.parentHardwareId",
              "hr.childHardwareId as hardwareId",
              "hardware.serialNumber as serialNumber",
              "hardware.partVariationId as partVariationId",
              "part_variation.partNumber as partNumber",
            ]),
        ),
    )
    .selectFrom("hardware_tree")
    .selectAll()
    .execute();

  return buildHardwareTree(hardware, edges);
}

type HardwareEdge = {
  hardwareId: string;
  serialNumber: string;
  parentHardwareId: string;
  partVariationId: string;
  partNumber: string;
};

export function buildHardwareTree(
  rootHardware: Omit<HardwareTreeRoot, "components">,
  edges: HardwareEdge[],
) {
  const nodes = new Map<string, HardwareTreeNode>();
  const root: HardwareTreeRoot = { ...rootHardware, components: [] };

  for (const edge of edges) {
    const parent = nodes.get(edge.parentHardwareId) ?? root;
    let cur = nodes.get(edge.hardwareId);

    if (!cur) {
      cur = {
        id: edge.hardwareId,
        serialNumber: edge.serialNumber,
        partVariationId: edge.partVariationId,
        partNumber: edge.partNumber,
        components: [],
      };
      nodes.set(edge.hardwareId, cur);
    }

    parent.components.push(cur);
  }

  return root;
}

export async function getHardwareComponentsWithPartVariation(id: string) {
  return await db
    .selectFrom("hardware_relation as hr")
    .innerJoin("hardware", "hardware.id", "hr.childHardwareId")
    .innerJoin(
      "part_variation",
      "part_variation.id",
      "hardware.partVariationId",
    )
    .select([
      "hr.childHardwareId as hardwareId",
      "part_variation.id as partVariationId",
    ])
    .where("hr.parentHardwareId", "=", id)
    .execute();
}
