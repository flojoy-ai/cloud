import { SearchResult, searchInput } from "@cloud/shared";
import Elysia from "elysia";
import { SqlBool, sql } from "kysely";
import { db } from "../db/kysely";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { SearchResultType } from "@cloud/shared";

function makeQuery(
  tableName: SearchResultType,
  query: string,
  workspaceId: string,
) {
  switch (tableName) {
    case "product":
    case "part":
    case "project":
      return db
        .selectFrom(tableName)
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`${tableName}`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceId);
    case "partVariation":
      return db
        .selectFrom("part_variation")
        .select(["partNumber as name", "id"])
        .select(sql<SearchResult["type"]>`'partVariation'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceId);
    case "unit":
      return db
        .selectFrom("unit")
        .select(["serialNumber as name", "id"])
        .select(sql<SearchResult["type"]>`'unit'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceId);
  }
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

      const productQuery = makeQuery("product", query, workspace.id);
      const partQuery = makeQuery("part", query, workspace.id);
      const partVariationQuery = makeQuery(
        "partVariation",
        query,
        workspace.id,
      );
      const unitQuery = makeQuery("unit", query, workspace.id);
      const projectQuery = makeQuery("project", query, workspace.id);

      const searchQuery = [
        productQuery,
        partQuery,
        partVariationQuery,
        unitQuery,
        projectQuery,
      ]
        .reduce((q, acc) => acc.unionAll(q))
        .orderBy("dist")
        .limit(10);

      return await searchQuery.execute();
    },
    { query: searchInput },
  );
