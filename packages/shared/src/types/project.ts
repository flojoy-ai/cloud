import { t, Static } from "elysia";

export type { Project } from "../schemas/public/Project";

export const CreateProjectSchema = t.Object({
  name: t.String({ minLength: 1 }),
  partVariationId: t.String({ minLength: 1 }),
  workspaceId: t.String(),
  repoUrl: t.Optional(t.String()),
});

export type CreateProjectSchema = Static<typeof CreateProjectSchema>;
