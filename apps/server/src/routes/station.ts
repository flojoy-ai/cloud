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
        .executeTakeFirst();

      if (!station) {
        return error(404, "station not found");
      }

      return station;
    },
    {
      async beforeHandle({ workspaceUser, params: { stationId }, error }) {
        const perm = await checkStationPerm({ workspaceUser, stationId });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
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
        const perm = await checkProjectPerm({ workspaceUser, projectId });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
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
        const perm = await checkProjectPerm({ workspaceUser, projectId });

        return perm.match(
          (perm) => (perm.canWrite() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  );
