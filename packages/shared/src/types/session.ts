import { t, Static } from "elysia";
import { sessionMeasurement } from "./measurement";

export type { Session } from "../schemas/public/Session";

export const insertSession = t.Object({
  serialNumber: t.String(),
  stationId: t.String(),
  integrity: t.Boolean(),
  aborted: t.Boolean(),
  notes: t.Optional(t.String()),
  commitHash: t.Optional(t.String()),
  measurements: t.Array(sessionMeasurement),
  createdAt: t.Optional(t.Date()),
});

export type InsertSession = Static<typeof insertSession>;
