import { type Kysely } from "kysely";
import { DB, InsertMeasurement, MeasurementData } from "@cloud/shared";
import { generateDatabaseId } from "../lib/db-utils";
import { getTagsByNames, markUpdatedAt } from "../db/query";
import { err } from "neverthrow";

export async function createMeasurement(
  db: Kysely<DB>,
  workspaceId: string,
  meas: InsertMeasurement,
) {
  const { tagNames, ...input } = meas;

  const measurement = await db
    .insertInto("measurement")
    .values({
      id: generateDatabaseId("measurement"),
      storageProvider: "postgres",
      ...input,
    })
    .returning("id")
    .executeTakeFirst();
  if (measurement === undefined) {
    return err("Failed to create measurement");
  }

  const res = await getTagsByNames(db, tagNames, {
    workspaceId,
    createIfNotExists: true,
  });
  if (res.isErr()) {
    return res;
  }

  const tags = res.value;

  if (tags.length > 0) {
    await db
      .insertInto("measurement_tag")
      .values(
        tags.map((t) => ({
          tagId: t.id,
          measurementId: measurement.id,
        })),
      )
      .execute();
  }

  await markUpdatedAt(db, "test", input.testId);
  await markUpdatedAt(db, "unit", input.unitId);

  return measurement.id;
}

export async function getTestMeasurements(db: Kysely<DB>, testId: string) {
  return await db
    .selectFrom("measurement")
    .selectAll()
    .where("testId", "=", testId)
    .$narrowType<{ data: MeasurementData }>()
    .execute();
}
