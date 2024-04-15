import { t, Static } from "elysia";
import { WorkspaceUser } from "../schemas/public/WorkspaceUser";
import { User } from "../schemas/public/User";

export type { Workspace } from "../schemas/public/Workspace";
export type { WorkspaceUser } from "../schemas/public/WorkspaceUser";

export const createWorkspace = t.Object({
  name: t.String({ minLength: 1 }),
  namespace: t.String({ minLength: 1 }),
  populateData: t.Boolean(),
});

export const updateWorkspace = t.Object({
  name: t.String({ minLength: 1 }),
  namespace: t.String({ minLength: 1 }),
});

export const planType = t.Union([
  t.Literal("hobby"),
  t.Literal("pro"),
  t.Literal("enterprise"),
]);

export const workspace = t.Object({
  id: t.String(),
  name: t.String(),
  namespace: t.String(),
  planType: planType,
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type CreateWorkspace = Static<typeof createWorkspace>;
export type UpdateWorkspace = Static<typeof updateWorkspace>;

export const workspaceRoleType = t.Union([
  t.Literal("owner"),
  t.Literal("admin"),
  t.Literal("member"),
]);

export const workspaceUserInvite = t.Object({
  email: t.String(),
  role: workspaceRoleType,
});

export type WorkspaceUserInvite = Static<typeof workspaceUserInvite>;

export type WorkspaceUserWithUser = WorkspaceUser & { user: User };
