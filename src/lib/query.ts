import type DB from "~/schemas/Database";
import { type ExpressionBuilder, type Kysely } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { type Model } from "~/schemas/public/Model";
import { db } from "~/server/db";
import { ModelTree } from "~/types/model";
import { Hardware } from "~/schemas/public/Hardware";
import { HardwareTree } from "~/types/hardware";
import { Project } from "~/schemas/public/Project";

export async function getProjectById(id: string) {
  return await db
    .selectFrom("project")
    .selectAll("project")
    .where("project.id", "=", id)
    .select((eb) => withProjectModel(eb))
    .$narrowType<{ model: Model }>()
    .executeTakeFirst();
}

export async function getHardwareById(id: string) {
  return await db
    .selectFrom("hardware")
    .selectAll("hardware")
    .where("hardware.id", "=", id)
    .select((eb) => withHardwareModel(eb))
    .$narrowType<{ model: Model }>()
    .executeTakeFirst();
}

export const notInUse = ({
  not,
  exists,
  selectFrom,
}: ExpressionBuilder<DB, "hardware">) => {
  return not(
    exists(
      selectFrom("hardware_relation")
        .select("parentHardwareId")
        .where("childHardwareId", "=", "hardware.id"),
    ),
  );
};

export async function getHardwaresByIds(ids: string[]) {
  let query = db
    .selectFrom("hardware")
    .selectAll("hardware")
    .where("hardware.id", "in", ids)
    .select((eb) => withHardwareModel(eb))
    .$narrowType<{ model: Model }>();

  return await query.execute();
}

export async function getModelById(id: string) {
  return await db
    .selectFrom("model")
    .selectAll("model")
    .where("model.id", "=", id)
    .executeTakeFirst();
}

type ModelEdge = {
  name: string;
  modelId: string;
  parentModelId: string;
  count: number;
};

type HardwareEdge = {
  name: string;
  hardwareId: string;
  parentHardwareId: string;
};

export async function getModelTree(model: Model): Promise<ModelTree> {
  const edges = await db
    .withRecursive("model_tree", (qb) =>
      qb
        .selectFrom("model_relation as mr")
        .innerJoin("model", "mr.childModelId", "model.id")
        .select([
          "parentModelId",
          "count",
          "childModelId as modelId",
          "model.name as name",
        ])
        .where("parentModelId", "=", model.id)
        .unionAll((eb) =>
          eb
            .selectFrom("model_relation as mr")
            .innerJoin("model", "mr.childModelId", "model.id")
            .innerJoin("model_tree", "model_tree.modelId", "mr.parentModelId")
            .select([
              "mr.parentModelId",
              "mr.count",
              "mr.childModelId as modelId",
              "model.name as name",
            ]),
        ),
    )
    .selectFrom("model_tree")
    .selectAll()
    .execute();

  return buildModelTree(model, edges);
}

export async function getHardwareTree(
  hardware: Hardware,
): Promise<HardwareTree> {
  const edges = await db
    .withRecursive("hardware_tree", (qb) =>
      qb
        .selectFrom("hardware_relation as hr")
        .innerJoin("hardware", "hr.childHardwareId", "hardware.id")
        .select([
          "parentHardwareId",
          "childHardwareId as hardwareId",
          "hardware.name as name",
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
            .select([
              "hr.parentHardwareId",
              "hr.childHardwareId as hardwareId",
              "hardware.name as name",
            ]),
        ),
    )
    .selectFrom("hardware_tree")
    .selectAll()
    .execute();

  return buildHardwareTree(hardware, edges);
}

export function buildModelTree(root: Model, edges: ModelEdge[]) {
  const nodes = new Map<string, ModelTree>();
  nodes.set(root.id, { id: root.id, name: root.name, components: [] });

  for (const edge of edges) {
    let parent = nodes.get(edge.parentModelId);
    if (!parent) {
      throw new Error("Shouldn't happen");
    }
    let cur = nodes.get(edge.modelId);

    if (!cur) {
      cur = { id: edge.modelId, name: edge.name, components: [] };
      nodes.set(edge.modelId, cur);
    }

    parent.components.push({ count: edge.count, model: cur });
  }

  return nodes.get(root.id)!;
}

export function buildHardwareTree(root: Hardware, edges: HardwareEdge[]) {
  const nodes = new Map<string, HardwareTree>();
  nodes.set(root.id, { id: root.id, name: root.name, components: [] });

  for (const edge of edges) {
    let parent = nodes.get(edge.parentHardwareId);
    if (!parent) {
      throw new Error("Shouldn't happen");
    }
    let cur = nodes.get(edge.hardwareId);

    if (!cur) {
      cur = { id: edge.hardwareId, name: edge.name, components: [] };
      nodes.set(edge.hardwareId, cur);
    }

    parent.components.push({ hardware: cur });
  }

  return nodes.get(root.id)!;
}

export async function getModelComponents(id: string) {
  return await db
    .selectFrom("model_relation")
    .select(["childModelId as modelId", "count"])
    .where("parentModelId", "=", id)
    .execute();
}

export async function markUpdatedAt(
  db: Kysely<DB>,
  table: "project" | "hardware" | "test" | "workspace",
  id: string,
) {
  await db
    .updateTable(table)
    .set({ updatedAt: new Date() })
    .where(`${table}.id`, "=", id)
    .execute();
}

export function withHardwareModel(eb: ExpressionBuilder<DB, "hardware">) {
  return jsonObjectFrom(
    eb
      .selectFrom("model")
      .selectAll("model")
      .whereRef("model.id", "=", "hardware.modelId"),
  ).as("model");
}

export function withProjectModel(eb: ExpressionBuilder<DB, "project">) {
  return jsonObjectFrom(
    eb
      .selectFrom("model")
      .selectAll("model")
      .whereRef("model.id", "=", "project.modelId"),
  ).as("model");
}

export function withHardware(eb: ExpressionBuilder<DB, "measurement">) {
  return jsonObjectFrom(
    eb
      .selectFrom("hardware")
      .selectAll("hardware")
      .whereRef("hardware.id", "=", "measurement.hardwareId")
      .select((eb) => withHardwareModel(eb))
      .$narrowType<{ model: Model }>(),
  ).as("hardware");
}

export function withProjects(eb: ExpressionBuilder<DB, "hardware">) {
  return jsonArrayFrom(
    eb
      .selectFrom("project_hardware as ph")
      .whereRef("ph.hardwareId", "=", "hardware.id")
      .innerJoin("project", "ph.projectId", "project.id")
      .selectAll("project"),
  ).as("projects");
}
