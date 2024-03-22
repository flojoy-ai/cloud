import { t, Static } from "elysia";

export const createWorkspace = t.Object({
  name: t.String({ minLength: 1 }),
  namespace: t.String({ minLength: 1 }),
  populateData: t.Boolean(),
});
export type CreateWorkspace = Static<typeof createWorkspace>;
