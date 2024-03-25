import { db } from "@/db/kysely";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import { SearchResult, searchInput, searchResultTypes } from "@/types/search";
import Elysia from "elysia";
import { Kysely, sql, SqlBool } from "kysely";
import DB from "@/schemas/Database";

function nameSearch(
  db: Kysely<DB>,
  query: string,
  workspaceId: string,
  type: SearchResult["type"],
) {
  return db
    .selectFrom(type)
    .select(["name", "id"])
    .select(sql<SearchResult["type"]>`${type}`.as("type"))
    .select(sql`name <-> ${query}`.as("dist"))
    .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
    .where("workspaceId", "=", workspaceId);
}

export const SearchRoute = new Elysia({ prefix: "/search" })
  .use(WorkspaceMiddleware)
  .get(
    "/",
    async ({ query: queryParams, workspace }) => {
      if (queryParams.query.length === 0) {
        return [];
      }
      const { query } = queryParams;

      const queries = searchResultTypes.map((table) =>
        nameSearch(db, query, workspace.id, table),
      );

      const searchQuery = queries
        .reduce((q, acc) => acc.unionAll(q))
        .orderBy("dist")
        .limit(10);

      return await searchQuery.execute();
    },
    { query: searchInput },
  );
