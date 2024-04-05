import { insertSession } from "@cloud/shared";
import Elysia, { t } from "elysia";
import { db } from "../db/kysely";
import {
  createSession,
  getSession,
  getSessionsByProject,
  getSessionsByStation,
  getSessionsByUnitId,
} from "../db/session";
import { fromTransaction } from "../lib/db-utils";
import { checkSessionPerm } from "../lib/perm/session";
import { WorkspaceMiddleware } from "../middlewares/workspace";

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
    "/project/:projectId",
    async ({ params: { projectId }, workspaceUser }) => {
      return await getSessionsByProject(projectId, workspaceUser);
    },
    { params: t.Object({ projectId: t.String() }) },
  )
  .get(
    "/station/:stationId",
    async ({ params: { stationId }, workspaceUser }) => {
      return await getSessionsByStation(stationId, workspaceUser);
    },
    { params: t.Object({ stationId: t.String() }) },
  )
  .get(
    "/:sessionId",
    async ({ error, params: { sessionId } }) => {
      const session = await getSession(db, sessionId);
      if (session === undefined) {
        return error(404, "Test session not found");
      }
      console.log(session);
      return session;
    },
    { params: t.Object({ sessionId: t.String() }) },
  )
  .post(
    "/",
    async ({ error, body, user, workspace }) => {
      const res = await fromTransaction(
        async (tx) => await createSession(tx, workspace.id, user.id, body),
      );
      if (res.isErr()) {
        return error(res.error.code, res.error);
      }
      return res.value;
    },
    {
      body: insertSession,
      params: t.Object({ sessionId: t.String() }),
      async beforeHandle({ params: { sessionId }, workspaceUser, error }) {
        const perm = await checkSessionPerm({
          sessionId,
          workspaceUser,
        });

        if (perm.isErr()) {
          return error(403, perm.error);
        }

        if (!perm.value.canRead()) {
          return error(403, "You do not have permission to read this session");
        }
      },
    },
  );
