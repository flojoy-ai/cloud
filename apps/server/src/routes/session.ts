import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { createSession, getSession, getSessionsByUnit, getSessionsByProject, getSessionsByStation } from "../db/session";
import { insertMeasurement, insertSession, sessionMeasurement } from "@cloud/shared";
import { AuthMiddleware } from "../middlewares/auth";
import { createMeasurement } from "../db/measurement";
import { getStation } from "../db/station";
import { getUnit, getUnitBySerialNumber } from "../db/unit";

export const SessionRoute = new Elysia({ prefix: "/session" })
  .use(WorkspaceMiddleware)
  // Get all test sessions for a unit instance
  .get(
    "/unit/:unitId",
    async ({ params: { unitId } }) => {
      return await getSessionsByUnit(db, unitId);
    },
    { params: t.Object({ unitId: t.String() }) },
  )
  .get(
    "/project/:projectId",
    async ({ params: { projectId } }) => {
      return await getSessionsByProject(db, projectId);
    },
    { params: t.Object({ projectId: t.String() }) },
  )
  .get(
    "/station/:stationId",
    async ({ params: { stationId } }) => {
      return await getSessionsByStation(db, stationId);
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
  ).post(
    "/",
    async ({ error, body, user, workspace }) => {
      const station = await getStation(db, body.stationId);
      if (station === undefined) {
        return error(404, "Station not found");
      }
      const unit = await getUnitBySerialNumber(db, body.serialNumber);
      if (unit === undefined) {
        return error(404, `Serial Number ${body.serialNumber} not found`);
      }
      const toInsertSession = {
        unitId: unit.id,
        userId: user.id,
        projectId: station.projectId,
        stationId: body.stationId,
        integrity: body.integrity,
        aborted: body.aborted,
        notes: body.notes,
        commitHash: body.commitHash,
      };
      const newSession = await createSession(db, toInsertSession);
      if (newSession.isErr()) {
        return error(500, newSession.error);
      }
      // Create all the measurements for this session
      await Promise.all(
        body.measurements.map((measurement) => createMeasurement(db, workspace.id, {
          ...measurement,
          sessionId: newSession.value.id,
          unitId: unit.id,
          projectId: station.projectId,
          tagNames: []
        }))
      );
      return { ...newSession.value };
    },
    {
      body: t.Object({ 
        serialNumber: t.String(),
        stationId: t.String(),
        integrity: t.Boolean(),
        aborted: t.Boolean(),
        notes: t.Optional(t.String()),
        commitHash: t.Optional(t.String()),
        measurements: t.Array(sessionMeasurement), 
      }),
    },
  );

