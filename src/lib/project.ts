import { db } from "~/server/db";

export async function getProjectById(id: string) {
  return await db
    .selectFrom("project")
    .selectAll("project")
    .where("project.id", "=", id)
    .executeTakeFirst();
}
