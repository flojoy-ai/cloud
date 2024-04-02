import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { getSession, getSessions } from "../db/session";

export const SessionRoute = new Elysia({ prefix: "/session" })
  .use(WorkspaceMiddleware)
  // Get all test sessions for a unit instance
  .get(
    "/unit/:unitId",
    async ({ params: { unitId } }) => {
      return await getSessions(db, unitId);
    },
    { params: t.Object({ unitId: t.String() }) },
  )
  .get(
    "/:sessionId",
    async ({ error, params: { sessionId } }) => {
      const session = await getSession(db, sessionId);
      if (session === undefined) {
        return error(404, "Test session not found");
      }
      return session;
    },
    { params: t.Object({ sessionId: t.String() }) },
  );
