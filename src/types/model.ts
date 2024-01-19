import { model } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectModel = typeof model.$inferSelect;

export const insertModelSchema = createInsertSchema(model);

export const publicInsertModelSchema = insertModelSchema.pick({
  name: true,
  workspaceId: true,
  type: true,
});

export const selectModelSchema = createSelectSchema(model);
