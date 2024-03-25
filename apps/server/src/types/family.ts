import { t, Static } from "elysia";

export const insertFamily = t.Object({
  workspaceId: t.String(),
  productName: t.String(),
  name: t.String(),
  description: t.Optional(t.String()),
});

export type InsertFamily = Static<typeof insertFamily>;