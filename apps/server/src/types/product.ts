import { t, Static } from "elysia";

export const createProduct = t.Object({
  workspaceId: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
});
export type CreateProduct = Static<typeof createProduct>;
