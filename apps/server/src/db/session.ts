import type DB from "@/schemas/Database";
import { Kysely } from "kysely";
import { generateDatabaseId } from "@/lib/db-utils";
import { Result, err, ok } from "neverthrow";
import { Session } from "@/schemas/public/Session";
import { InsertSession } from "@/types/session";

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
