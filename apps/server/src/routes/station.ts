import { db } from "../db/kysely";
import { createStation } from "../db/station";
import { InsertStation } from "@cloud/shared";
import { Elysia, error, t } from "elysia";
import { DatabaseError } from "pg";

export const StationRoute = new Elysia({
  prefix: "/station",
  name: "StationRoute",
})
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
  .get("/:stationId", async ({ params: { stationId } }) => {
    // FIXME: permission check
    const station = await db
      .selectFrom("station as s")
      .selectAll()
      .where("s.id", "=", stationId)
      .executeTakeFirstOrThrow();
    return station;
  })
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
    },
  );
