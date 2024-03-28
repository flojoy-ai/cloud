import { Static, t } from "elysia";
import { measurementData } from "./data";

export const insertMeasurement = t.Object({
  hardwareId: t.String(),
  testId: t.String(),
  sessionId: t.String(),
  projectId: t.String(),
  name: t.String({ default: "Untitled measurement" }),
  data: measurementData,
  pass: t.Nullable(t.Boolean()),
  createdAt: t.Date(),
  tagNames: t.Array(t.String(), { default: [] }),
});

export type InsertMeasurement = Static<typeof insertMeasurement>;
