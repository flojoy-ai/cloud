import { t, Static } from "elysia";

export const insertStation = t.Object({
  name: t.String({ minLength: 1 }),
  projectId: t.String(),
});

export type InsertStation = Static<typeof insertStation>;
