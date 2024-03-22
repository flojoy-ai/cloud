import { t, Static } from "elysia";

export const insertProject = t.Object({
  name: t.String({ minLength: 1 }),
  modelId: t.String(),
  workspaceId: t.String(),
  repoUrl: t.Optional(t.String()),
});

export type InsertProject = Static<typeof insertProject>;
