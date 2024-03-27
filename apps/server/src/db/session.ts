import type DB from "@/schemas/Database";
import { ExpressionBuilder, Kysely } from "kysely";
import { generateDatabaseId } from "@/lib/db-utils";
import { Result, err, ok } from "neverthrow";
import { Session } from "@/schemas/public/Session";
import { InsertSession } from "@/types/session";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export async function getSessions(db: Kysely<DB>, hardwareId: string) {
  return await db
    .selectFrom("session")
    .selectAll()
    .where("hardwareId", "=", hardwareId)
    .execute();
}

export function withSessionMeasurements(eb: ExpressionBuilder<DB, "session">) {
  return jsonArrayFrom(
    eb
      .selectFrom("measurement")
      .selectAll("measurement")
      .whereRef("measurement.sessionId", "=", "session.id"),
  ).as("measurements");
}

export async function getSession(db: Kysely<DB>, sessionId: string) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .select((eb) => withSessionMeasurements(eb))
    .where("session.id", "=", sessionId)
    .executeTakeFirst();
}

export async function createSession(
  db: Kysely<DB>,
  input: InsertSession,
): Promise<Result<Session, string>> {
  const session = await db
    .insertInto("session")
    .values({
      id: generateDatabaseId("session"),
      ...input,
    })
    .returningAll()
    .executeTakeFirst();

  if (session === undefined) {
    return err("Failed to create session");
  }

  return ok(session);
}
