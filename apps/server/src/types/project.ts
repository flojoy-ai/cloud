import { t, Static } from "elysia";

export const CreateProjectSchema = t.Object({
  name: t.String({ minLength: 1 }),
  modelId: t.String(),
  workspaceId: t.String(),
  repoUrl: t.Optional(t.String()),
});

export type CreateProjectSchema = Static<typeof CreateProjectSchema>;
