import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { getSession, getSessions } from "../db/session";

export const SessionRoute = new Elysia({ prefix: "/session" })
  .use(WorkspaceMiddleware)
  // Get all test sessions for a hardware instance
  .get(
    "/hardware/:hardwareId",
    async ({ params: { hardwareId } }) => {
      return await getSessions(db, hardwareId);
    },
    { params: t.Object({ hardwareId: t.String() }) },
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
