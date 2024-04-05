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
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkStationPerm } from "../lib/perm/station";

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
      async beforeHandle({ workspaceUser, error, body: { stationId } }) {
        const perm = await checkStationPerm({
          stationId,
          workspaceUser,
        });

        if (perm.isErr()) {
          return error(403, perm.error);
        }

        if (!perm.value.canWrite()) {
          return error(
            403,
            "You do not have permission to add session to this station",
          );
        }
      },
    },
  );
