import { DB, InsertTest, MeasurementData } from "@cloud/shared";
import { Kysely } from "kysely";
import { err, ok } from "neverthrow";
import { generateDatabaseId } from "../lib/db-utils";

export async function createTest(db: Kysely<DB>, input: InsertTest) {
  const test = await db
    .insertInto("test")
    .values({
      id: generateDatabaseId("test"),
      ...input,
    })
    .returningAll()
    .executeTakeFirst();

  if (test === undefined) {
    return err("Failed to create test");
  }

  return ok(test);
}

export async function getTest(db: Kysely<DB>, testId: string) {
  return await db
    .selectFrom("test")
    .selectAll()
    .where("test.id", "=", testId)
    .executeTakeFirst();
}

export async function getTestMeasurements(db: Kysely<DB>, testId: string) {
  return await db
    .selectFrom("measurement")
    .selectAll("measurement")
    .innerJoin("unit", "unit.id", "measurement.unitId")
    .select("unit.serialNumber")
    .where("testId", "=", testId)
    .$narrowType<{ data: MeasurementData }>()
    .execute();
}

export async function getTestByName(db: Kysely<DB>, name: string) {
  return await db
    .selectFrom("test")
    .selectAll("test")
    .where("test.name", "=", name)
    .executeTakeFirst();
}
