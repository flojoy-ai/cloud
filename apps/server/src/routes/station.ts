import { db } from "@/db/kysely";
import { createStation } from "@/db/station";
// import { ProjectMiddleware } from "@/middlewares/project";
import { InsertStation } from "@/types/station";
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
  // .use(ProjectMiddleware)
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
