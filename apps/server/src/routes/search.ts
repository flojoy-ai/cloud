import { db } from "../db/kysely";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import {
  DB,
  SearchResult,
  searchInput,
  searchResultTypes,
} from "@cloud/shared";
import Elysia from "elysia";
import { Kysely, sql, SqlBool } from "kysely";

// TODO: Fix

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

      const productQuery = db
        .selectFrom("product")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'product'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const partQuery = db
        .selectFrom("part")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'part'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const partVariationQuery = db
        .selectFrom("part_variation")
        .select(["partNumber as name", "id"])
        .select(sql<SearchResult["type"]>`'partVariation'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const unitQuery = db
        .selectFrom("unit")
        .select(["serialNumber as name", "id"])
        .select(sql<SearchResult["type"]>`'unit'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

      const projectQuery = db
        .selectFrom("project")
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`'project'`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspace.id);

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
