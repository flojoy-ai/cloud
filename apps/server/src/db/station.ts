import { Kysely } from "kysely";
import { generateDatabaseId } from "../lib/db-utils";
import { Result, err, ok } from "neverthrow";
import { DB, Station, InsertStation } from "@cloud/shared";

export async function createStation(
  db: Kysely<DB>,
  input: InsertStation,
): Promise<Result<Station, string>> {
  const session = await db
    .insertInto("station")
    .values({
      id: generateDatabaseId("station"),
      ...input,
    })
    .returningAll()
    .executeTakeFirst();

  if (session === undefined) {
    return err("Failed to create station");
  }

  return ok(session);
}

export async function getStation(db: Kysely<DB>, stationId: string) {
  return await db
    .selectFrom("station")
    .selectAll("station")
    .where("station.id", "=", stationId)
    .executeTakeFirst();
}
