import { t, Static } from "elysia";
import { measurementType } from "./measurement";

export type { Test } from "../schemas/public/Test";

export const insertTest = t.Object({
  name: t.String({ minLength: 1 }),
  projectId: t.String(),
  measurementType: measurementType,
});

export type InsertTest = Static<typeof insertTest>;
