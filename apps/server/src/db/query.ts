import { generateDatabaseId } from "../lib/db-utils";
import { DB, Tag } from "@cloud/shared";
import { Kysely } from "kysely";
import _ from "lodash";
import { Result, errAsync, ok } from "neverthrow";

export async function markUpdatedAt(
  db: Kysely<DB>,
  table: "project" | "hardware" | "test" | "workspace",
  id: string,
) {
  await db
    .updateTable(table)
    .set({ updatedAt: new Date() })
    .where(`${table}.id`, "=", id)
    .execute();
}

export async function getTagsByNames(
  db: Kysely<DB>,
  tagNames: string[],
  opts: {
    workspaceId: string;
    createIfNotExists: boolean;
  },
): Promise<Result<Tag[], string>> {
  const uniqueNames = _.uniq(tagNames);

  if (opts.createIfNotExists) {
    // TODO: Change this into a map
    // Reason it isn't already is because i can't get
    // ResultAsync.combine to typecheck properly
    const tags = [];
    for (const name of uniqueNames) {
      const tag = await db
        .selectFrom("tag")
        .selectAll()
        .where("workspaceId", "=", opts.workspaceId)
        .where("tag.name", "=", name)
        .executeTakeFirst();

      if (tag) {
        tags.push(tag);
        continue;
      }

      const newTag = await db
        .insertInto("tag")
        .values({
          id: generateDatabaseId("tag"),
          name,
          workspaceId: opts.workspaceId,
        })
        .returningAll()
        .executeTakeFirst();
      if (newTag === undefined) {
        return errAsync("Failed to create tag");
      }
      tags.push(newTag);
    }
    return ok(tags);
  }

  return ok(
    await db
      .selectFrom("tag")
      .selectAll()
      .where("workspaceId", "=", opts.workspaceId)
      .where("tag.name", "in", uniqueNames)
      .execute(),
  );
}
