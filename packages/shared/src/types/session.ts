import { t, Static } from "elysia";

export type { Session } from "../schemas/public/Session";

export const insertSession = t.Object({
  hardwareId: t.String(),
  userId: t.Optional(t.String()), // TODO: Remove the optional?
  projectId: t.String(),
  stationId: t.String(),
  notes: t.Optional(t.String()),
  commitHash: t.Optional(t.String()),
});

export type InsertSession = Static<typeof insertSession>;