import { db } from "../db/kysely";
import { createStation } from "../db/station";
import { InsertStation } from "@cloud/shared";
import { Elysia, error, t } from "elysia";
import { DatabaseError } from "pg";
import { checkStationPerm } from "../lib/perm/station";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkProjectPerm } from "../lib/perm/project";

export const StationRoute = new Elysia({
  prefix: "/station",
  name: "StationRoute",
})
  .use(WorkspaceMiddleware)
  .error({
    DatabaseError,
  })
  .onError(({ code, error, set }) => {
    // TODO: handle this better
    switch (code) {
      case "DatabaseError":
        set.status = 409;
        return error;
      default:
        return error;
    }
  })
  .get(
    "/:stationId",
    async ({ params: { stationId } }) => {
      const station = await db
        .selectFrom("station as s")
        .selectAll()
        .where("s.id", "=", stationId)
        .executeTakeFirstOrThrow();
      return station;
    },
    {
      async beforeHandle({ workspaceUser, params: { stationId }, error }) {
        const result = await checkStationPerm(
          { workspaceUser, stationId },
          "read",
        );

        if (result.isErr()) {
          return error(403, result.error);
        }
        if (!result.value) {
          return error(403, "Forbidden");
        }
      },
    },
  )
  .get(
    "/",
    async ({ query }) => {
      return await db
        .selectFrom("station as s")
        .selectAll()
        .where("s.projectId", "=", query.projectId)
        .execute();
    },
    {
      query: t.Object({
        projectId: t.String(),
      }),
      async beforeHandle({ workspaceUser, query: { projectId }, error }) {
        const result = await checkProjectPerm(
          { workspaceUser, projectId },
          "read",
        );

        if (result.isErr()) {
          return error(403, result.error);
        }
        if (!result.value) {
          return error(403, "Forbidden");
        }
      },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const station = await createStation(db, {
        ...body,
      });

      if (station.isErr()) {
        return error(500, station.error);
      }
      return station.value;
    },
    {
      body: InsertStation,
      async beforeHandle({ workspaceUser, body: { projectId }, error }) {
        const result = await checkProjectPerm(
          { workspaceUser, projectId },
          "write",
        );

        if (result.isErr()) {
          return error(403, result.error);
        }
        if (!result.value) {
          return error(403, "Forbidden");
        }
      },
    },
  );
