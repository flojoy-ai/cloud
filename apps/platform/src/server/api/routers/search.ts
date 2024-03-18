import { createTRPCRouter, workspaceProcedure } from "../trpc";
import { SearchResult, searchInput, searchResult } from "~/types/search";
import { Kysely, SqlBool, sql } from "kysely";
import { workspaceAccessMiddleware } from "./workspace";
import type DB from "~/schemas/Database";

export const searchRouter = createTRPCRouter({
  search: workspaceProcedure
    .input(searchInput)
    .use(workspaceAccessMiddleware)
    .output(searchResult.array())
    .query(async ({ ctx, input }) => {
      // Postgres driver complains about not being able to
      // tell what type 'type' is if i extract this into a function :(
      const modelQuery = ctx.db
        .selectFrom("model")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'model'`.as("type"))
        .select(sql`similarity(name, ${input.query})`.as("sml"))
        .where("workspaceId", "=", input.workspaceId)
        .where(sql<SqlBool>`name % ${input.query}`);

      const projectQuery = ctx.db
        .selectFrom("project")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'project'`.as("type"))
        .select(sql`similarity(name, ${input.query})`.as("sml"))
        .where("workspaceId", "=", input.workspaceId)
        .where(sql<SqlBool>`name % ${input.query}`);

      const hardwareQuery = ctx.db
        .selectFrom("hardware")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'hardware'`.as("type"))
        .select(sql`similarity(name, ${input.query})`.as("sml"))
        .where("workspaceId", "=", input.workspaceId)
        .where(sql<SqlBool>`name % ${input.query}`);

      const res = await modelQuery
        .unionAll(projectQuery)
        .unionAll(hardwareQuery)
        .orderBy("sml", "desc")
        .limit(5)
        .execute();

      return res;
    }),
});
