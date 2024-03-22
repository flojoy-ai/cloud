import type DB from "@/schemas/Database";
import { Kysely } from "kysely";
import { generateDatabaseId } from "@/lib/db-utils";
import { markUpdatedAt } from "@/db/query";
import { InsertModel } from "@/types/model";
import { Result, err, ok } from "neverthrow";
import { Model } from "@/schemas/public/Model";

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
