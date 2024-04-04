import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { getSession, getSessionsByUnitId } from "../db/session";
import { checkSessionPerm } from "../lib/perm/session";

export const SessionRoute = new Elysia({
  prefix: "/session",
  name: "SessionRoute",
})
  .use(WorkspaceMiddleware)
  .get(
    "/unit/:unitId",
    async ({ params: { unitId }, workspaceUser }) => {
      return await getSessionsByUnitId(unitId, workspaceUser);
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
    {
      params: t.Object({ sessionId: t.String() }),
      async beforeHandle({ params: { sessionId }, workspaceUser, error }) {
        const hasPermission = await checkSessionPerm(
          {
            sessionId,
            workspaceUser,
          },
          "read",
        );

        if (hasPermission.isErr()) {
          return error(403, hasPermission.error);
        }

        if (!hasPermission.value) {
          return error(403, "You do not have permission to read this session");
        }
      },
    },
  );
