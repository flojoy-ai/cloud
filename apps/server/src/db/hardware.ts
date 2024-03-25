import { generateDatabaseId } from "@/lib/db-utils";
import DB from "@/schemas/Database";
import { Model } from "@/schemas/public/Model";
import { Hardware, HardwareTree, InsertHardware } from "@/types/hardware";
import { ExpressionBuilder, Kysely } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import _ from "lodash";
import { User } from "lucia";
import { fromPromise } from "neverthrow";
import { db } from "./kysely";
import { getModel, getModelComponents } from "./model";
import { markUpdatedAt } from "./query";

// TODO: Make this return a proper error type
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
        throw new Error("Model not found");
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
        throw new Error("Failed to create hardware");
      }

      const modelComponents = await getModelComponents(model.id);

      if (modelComponents.length > 0) {
        const ids = components;
        if (_.uniq(ids).length !== ids.length) {
          throw new Error("Duplicate hardware devices");
        }

        const hardwares = await db
          .selectFrom("hardware")
          .selectAll("hardware")
          .where("hardware.id", "in", ids)
          .where(notInUse)
          .execute();

        if (hardwares.length !== components.length) {
          throw new Error("Some hardware devices are already in use!");
        }

        const modelCount = _.countBy(hardwares, (h) => h.modelId);
        const matches = _.every(
          modelComponents,
          (c) => modelCount[c.modelId] === c.count,
        );

        if (!matches) {
          throw new Error("Components do not satisfy model requirements");
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
    (e) => e as Error,
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

type HardwareWithModel = Hardware & { model: Model };

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
