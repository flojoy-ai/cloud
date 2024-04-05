import { t, Static } from "elysia";

export type { Part } from "../schemas/public/Part";

export const insertPart = t.Object({
  workspaceId: t.String(),
  name: t.String({ minLength: 1 }),
  productName: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
});

export type InsertPart = Static<typeof insertPart>;
