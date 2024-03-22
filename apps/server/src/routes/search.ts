import { db } from "@/db/kysely";
import { AuthMiddleware } from "@/middlewares/auth";
import { SearchResult, searchInput } from "@/types/search";
import Elysia from "elysia";
import { sql, SqlBool } from "kysely";

export const searchRoute = new Elysia({ prefix: "/search" })
  .use(AuthMiddleware)
  .get(
    "/",
    async ({ body }) => {
      if (body.query.length === 0) {
        return [];
      }
      const { query, workspaceId } = body;

      // Postgres driver complains about not being able to
      // tell what type 'type' is if i extract this into a function :(
      const modelQuery = db
        .selectFrom("model")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'model'`.as("type"))
        .select(sql`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceId);

      const projectQuery = db
        .selectFrom("project")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'project'`.as("type"))
        .select(sql`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceId);

      const hardwareQuery = db
        .selectFrom("hardware")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'hardware'`.as("type"))
        .select(sql`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceId);

      const res = await modelQuery
        .unionAll(projectQuery)
        .unionAll(hardwareQuery)
        .orderBy("dist")
        .limit(10)
        .execute();

      return res;
    },
    { body: searchInput },
  );
