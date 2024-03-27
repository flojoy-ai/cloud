import { db } from "@/db/kysely";
import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import { getSession, getSessions } from "@/db/session";

export const SessionRoute = new Elysia({ prefix: "/session" })
  .use(WorkspaceMiddleware)
  // Get all test sessions for a hardware instance
  .get(
    "/hardware/:hardwareId",
    async ({ params: { hardwareId } }) => {
      const sessions = await getSessions(db, hardwareId);
      console.log(sessions);
      return sessions;
    },
    { params: t.Object({ hardwareId: t.String() }) },
  )
  .get(
    "/:sessionId",
    async ({ params: { sessionId } }) => {
      return await getSession(db, sessionId);
    },
    { params: t.Object({ sessionId: t.String() }) },
  );
