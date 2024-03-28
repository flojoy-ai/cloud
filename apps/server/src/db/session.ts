import type DB from "../schemas/Database";
import { ExpressionBuilder, Kysely, sql } from "kysely";
import { generateDatabaseId } from "../lib/db-utils";
import { Result, err, ok } from "neverthrow";
import { Session } from "../schemas/public/Session";
import { InsertSession } from "../types/session";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export async function getSessions(db: Kysely<DB>, hardwareId: string) {
  return await db
    .selectFrom("session")
    .selectAll()
    .select((eb) => withStatus(eb))
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

export function withStatus(eb: ExpressionBuilder<DB, "session">) {
  return eb
    .selectFrom("measurement as m")
    // TODO: Write this with kysely
    .select(sql<boolean | null>`
      CASE
        WHEN COUNT(CASE WHEN m.pass = false THEN 1 END) > 0 THEN false
        WHEN COUNT(CASE WHEN m.pass IS NULL then 1 END) > 0 THEN NULL
        ELSE true
      END
`.as("pass"))
    .whereRef("m.sessionId", "=", "session.id")
    .as("status");
}

export async function getSession(db: Kysely<DB>, sessionId: string) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .select((eb) => withSessionMeasurements(eb))
    .select((eb) => withStatus(eb))
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
