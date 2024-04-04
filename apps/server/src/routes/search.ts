import { SearchResult, WorkspaceUser, searchInput } from "@cloud/shared";
import Elysia from "elysia";
import { SqlBool, sql } from "kysely";
import { db } from "../db/kysely";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { SearchResultType } from "@cloud/shared";

function makeQuery(
  tableName: SearchResultType,
  query: string,
  workspaceUser: WorkspaceUser,
) {
  switch (tableName) {
    case "product":
    case "part":
      return db
        .selectFrom(tableName)
        .select(["name", "id"])
        .select(sql<SearchResult["type"]>`${tableName}`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceUser.workspaceId);
    case "project":
      return db
        .selectFrom(tableName)
        .select(["name", "id"])
        .innerJoin("project_user as pu", (join) =>
          join
            .on("pu.workspaceId", "=", workspaceUser.workspaceId)
            .on("pu.userId", "=", workspaceUser.userId)
            .onRef("pu.projectId", "=", "project.id"),
        )
        .where("pu.role", "!=", "pending")
        .select(sql<SearchResult["type"]>`${tableName}`.as("type"))
        .select(sql<number>`name <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(name <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceUser.workspaceId);
    case "partVariation":
      return db
        .selectFrom("part_variation")
        .select(["part_variation.partNumber as name", "id"])
        .select(sql<SearchResult["type"]>`'partVariation'`.as("type"))
        .select(sql<number>`part_variation.part_number <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(part_variation.part_number <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceUser.workspaceId);
    case "unit":
      return db
        .selectFrom("unit")
        .select(["unit.serialNumber as name", "id"])
        .select(sql<SearchResult["type"]>`'unit'`.as("type"))
        .select(sql<number>`unit.serial_number <-> ${query}`.as("dist"))
        .where(sql<SqlBool>`(unit.serial_number <-> ${query}) < 0.85`)
        .where("workspaceId", "=", workspaceUser.workspaceId);
  }
}

export const SearchRoute = new Elysia({
  prefix: "/search",
  name: "SearchRoute",
})
  .use(WorkspaceMiddleware)
  .get(
    "/",
    async ({ query: queryParams, workspaceUser, error }) => {
      if (queryParams.query.length === 0) {
        return [];
      }
      if (workspaceUser.role === "pending") {
        return error("Forbidden");
      }

      const { query } = queryParams;

      const productQuery = makeQuery("product", query, workspaceUser);
      const partQuery = makeQuery("part", query, workspaceUser);
      const partVariationQuery = makeQuery(
        "partVariation",
        query,
        workspaceUser,
      );
      const unitQuery = makeQuery("unit", query, workspaceUser);
      const projectQuery = makeQuery("project", query, workspaceUser);

      const searchQuery = [
        productQuery,
        partQuery,
        partVariationQuery,
        unitQuery,
        projectQuery,
      ]
        .reduce((q, acc) => acc.unionAll(q))
        // FIXME: fix type checking
        // @ts-expect-error kysely can't infer the type properly
        .orderBy("dist")
        .limit(10);

      return await searchQuery.execute();
    },
    { query: searchInput },
  );
