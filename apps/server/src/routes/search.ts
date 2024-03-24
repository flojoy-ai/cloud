import { db } from "@/db/kysely";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import { SearchResult, searchInput } from "@/types/search";
import Elysia from "elysia";
import { sql, SqlBool } from "kysely";

export const SearchRoute = new Elysia({ prefix: "/search" })
  .use(WorkspaceMiddleware)
  .get(
    "/",
    async ({ query: queryParams, workspace }) => {
      if (queryParams.query.length === 0) {
        return [];
      }
      const { query } = queryParams;

      // Postgres driver complains about not being able to
      // tell what type 'type' is if i extract this into a function :(
      const modelQuery = db
        .selectFrom("model")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'model'`.as("type"))
        .select(sql`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const projectQuery = db
        .selectFrom("project")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'project'`.as("type"))
        .select(sql`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const hardwareQuery = db
        .selectFrom("hardware")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'hardware'`.as("type"))
        .select(sql`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const res = await modelQuery
        .unionAll(projectQuery)
        .unionAll(hardwareQuery)
        .orderBy("dist")
        .limit(10)
        .execute();

      return res;
    },
    { query: searchInput },
  );
