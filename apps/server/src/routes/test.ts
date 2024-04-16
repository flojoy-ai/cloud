import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { db } from "../db/kysely";
import { getTest, getTestMeasurements } from "../db/test";

export const TestRoute = new Elysia({ prefix: "/test", name: "TestRoute" })
  .use(WorkspaceMiddleware)
  .group("/:testId", (app) =>
    app
      .guard({ params: t.Object({ testId: t.String() }) })
      .get("/", async ({ params: { testId }, error }) => {
        const test = await getTest(db, testId);
        if (test === undefined) return error(404, "Test not found");

        return test;
      })
      .get("/measurements", async ({ params: { testId } }) => {
        return await getTestMeasurements(db, testId);
      }),
  );
