import { t, Static } from "elysia";

export type { Family } from "../schemas/public/Family";

export const insertFamily = t.Object({
  workspaceId: t.String(),
  name: t.String({ minLength: 1 }),
  productName: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
});

export type InsertFamily = Static<typeof insertFamily>;
