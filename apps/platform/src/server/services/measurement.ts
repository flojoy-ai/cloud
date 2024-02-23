import type DB from "~/schemas/Database";
import { type Kysely } from "kysely";
import _ from "lodash";
import { TRPCError } from "@trpc/server";
import { InsertMeasurement } from "~/types/measurement";
import { generateDatabaseId } from "~/lib/id";
import { getTagsByNames, markUpdatedAt } from "~/lib/query";

export async function createMeasurement(
  db: Kysely<DB>,
  workspaceId: string,
  meas: InsertMeasurement,
) {
  const { tagNames, ...input } = meas;

  const res = await db
    .insertInto("measurement")
    .values({
      id: generateDatabaseId("measurement"),
      storageProvider: "postgres",
      ...input,
    })
    .returning("id")
    .executeTakeFirstOrThrow(
      () =>
        new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create measurement",
        }),
    );

  const tags = await getTagsByNames(db, tagNames, {
    workspaceId,
    createIfNotExists: true,
  });

  if (tags.length > 0) {
    await db
      .insertInto("measurement_tag")
      .values(
        tags.map((t) => ({
          tagId: t.id,
          measurementId: res.id,
        })),
      )
      .execute();
  }

  await markUpdatedAt(db, "test", input.testId);
  await markUpdatedAt(db, "hardware", input.hardwareId);

  return res;
}
