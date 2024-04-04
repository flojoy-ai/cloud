import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import {
  createSession,
  getSession,
  getSessionsByUnit,
  getSessionsByProject,
  getSessionsByStation,
} from "../db/session";
import { insertSession } from "@cloud/shared";

export const SessionRoute = new Elysia({ prefix: "/session" })
  .use(WorkspaceMiddleware)
  // Get all test sessions for a unit instance
  .get(
    "/unit/:unitId",
    async ({ params: { unitId } }) => {
      return await getSessionsByUnit(unitId);
    },
    { params: t.Object({ unitId: t.String() }) },
  )
  .get(
    "/project/:projectId",
    async ({ params: { projectId } }) => {
      return await getSessionsByProject(projectId);
    },
    { params: t.Object({ projectId: t.String() }) },
  )
  .get(
    "/station/:stationId",
    async ({ params: { stationId } }) => {
      return await getSessionsByStation(stationId);
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
      const res = await createSession(db, workspace.id, user, body);
      if (res.isErr()) {
        return error(res.error.code, res.error);
      }
      return res.value;
    },
    {
      body: insertSession,
    },
  );
