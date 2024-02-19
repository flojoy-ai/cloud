import { TRPCError } from "@trpc/server";

import type DB from "~/schemas/Database";
import { Kysely } from "kysely";
import { withDBErrorCheck } from "~/lib/db-utils";
import { generateDatabaseId } from "~/lib/id";
import { markUpdatedAt } from "~/lib/query";
import { Project } from "~/schemas/public/Project";
import { InsertProject } from "~/types/project";

export async function createProject(
  db: Kysely<DB>,
  input: InsertProject,
): Promise<Project> {
  const project = await withDBErrorCheck(
    db
      .insertInto("project")
      .values({
        id: generateDatabaseId("project"),
        ...input,
      })
      .returningAll()
      .executeTakeFirstOrThrow(
        () =>
          new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          }),
      ),
    {
      errorCode: "DUPLICATE",
      errorMsg: `A project with name "${input.name}" already exists!`,
    },
  );

  await markUpdatedAt(db, "workspace", input.workspaceId);
  return project;
}
