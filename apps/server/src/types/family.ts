import { t, Static } from "elysia";

export const createFamily = t.Object({
  workspaceId: t.String(),
  productId: t.String(),
  name: t.String(),
  description: t.Optional(t.String()),
});
export type CreateFamily = Static<typeof createFamily>;
