import { t, Static } from "elysia";

export type { Product } from "../schemas/public/Product";

export const insertProduct = t.Object({
  workspaceId: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
});
export type InsertProduct = Static<typeof insertProduct>;
