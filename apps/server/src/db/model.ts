import type DB from "@/schemas/Database";
import { Kysely } from "kysely";
import { generateDatabaseId } from "@/lib/db-utils";
import { markUpdatedAt } from "@/db/query";
import { InsertModel, ModelTree } from "@/types/model";
import { Result, err, ok } from "neverthrow";
import { Model } from "@/schemas/public/Model";
import { db } from "./kysely";

export async function createModel(
  db: Kysely<DB>,
  input: InsertModel,
): Promise<Result<Model, string>> {
  const { components, ...newModel } = input;
  const model = await db
    .insertInto("model")
    .values({
      id: generateDatabaseId("model"),
      ...newModel,
    })
    .returningAll()
    .executeTakeFirst();

  if (model === undefined) {
    return err("Failed to create model");
  }

  if (components.length > 0) {
    await db
      .insertInto("model_relation")
      .values(
        components.map((c) => ({
          parentModelId: model.id,
          childModelId: c.modelId,
          count: c.count,
        })),
      )
      .execute();
  }

  await markUpdatedAt(db, "workspace", input.workspaceId);

  return ok(model);
}

export async function getModel(modelId: string) {
  return await db
    .selectFrom("model")
    .selectAll()
    .where("model.id", "=", modelId)
    .executeTakeFirst();
}

export async function getModelComponents(modelId: string) {
  return await db
    .selectFrom("model_relation")
    .select(["childModelId as modelId", "count"])
    .where("parentModelId", "=", modelId)
    .execute();
}

type ModelEdge = {
  name: string;
  modelId: string;
  parentModelId: string;
  count: number;
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

function buildModelTree(root: Model, edges: ModelEdge[]) {
  const nodes = new Map<string, ModelTree>();
  nodes.set(root.id, { id: root.id, name: root.name, components: [] });

  for (const edge of edges) {
    const parent = nodes.get(edge.parentModelId);
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
