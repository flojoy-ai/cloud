import { t, Static } from "elysia";

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
