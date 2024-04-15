import { t, Static } from "elysia";
import { ProjectUser } from "../schemas/public/ProjectUser";
import { User } from "../schemas/public/User";

export type { Project } from "../schemas/public/Project";
export type { ProjectUser } from "../schemas/public/ProjectUser";

export const CreateProjectSchema = t.Object({
  name: t.String({ minLength: 1 }),
  partVariationId: t.String({ minLength: 1 }),
  workspaceId: t.String(),
  repoUrl: t.Optional(t.String()),
});

export type CreateProjectSchema = Static<typeof CreateProjectSchema>;

export const UpdateProjectSchema = t.Object({
  name: t.String({ minLength: 1 }),
});

export type UpdateProjectSchema = Static<typeof UpdateProjectSchema>;

export type ProjectUserWithUser = ProjectUser & { user: User };
