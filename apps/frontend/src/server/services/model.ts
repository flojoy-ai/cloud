import { TRPCError } from "@trpc/server";

import type DB from "~/schemas/Database";
import { Kysely } from "kysely";
import { withDBErrorCheck } from "~/lib/db-utils";
import { generateDatabaseId } from "~/lib/id";
import { markUpdatedAt } from "~/lib/query";
import { InsertModel } from "~/types/model";
import { Model } from "~/schemas/public/Model";

export async function createModel(
  db: Kysely<DB>,
  input: InsertModel,
): Promise<Model> {
  const { components, ...newModel } = input;
  const model = await withDBErrorCheck(
    db
      .insertInto("model")
      .values({
        id: generateDatabaseId("model"),
        ...newModel,
      })
      .returningAll()
      .executeTakeFirstOrThrow(
        () =>
          new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create model",
          }),
      ),
    {
      errorCode: "DUPLICATE",
      errorMsg: `A model with identifier "${input.name}" already exists!`,
    },
  );

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

  return model;
}
