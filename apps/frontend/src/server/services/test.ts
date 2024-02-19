import { TRPCError } from "@trpc/server";

import type DB from "~/schemas/Database";
import { Kysely } from "kysely";
import { withDBErrorCheck } from "~/lib/db-utils";
import { generateDatabaseId } from "~/lib/id";
import { markUpdatedAt } from "~/lib/query";
import { Test } from "~/schemas/public/Test";
import { InsertTest } from "~/types/test";

export async function createTest(
  db: Kysely<DB>,
  input: InsertTest,
): Promise<Test> {
  const test = await withDBErrorCheck(
    db
      .insertInto("test")
      .values({
        id: generateDatabaseId("test"),
        ...input,
      })
      .returningAll()
      .executeTakeFirstOrThrow(
        () =>
          new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create test",
          }),
      ),
    {
      errorCode: "DUPLICATE",
      errorMsg: `A test with name "${input.name}" already exists!`,
    },
  );

  await markUpdatedAt(db, "project", input.projectId);

  return test;
}
