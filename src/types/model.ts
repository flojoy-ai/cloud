import { model } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectModel = typeof model.$inferSelect;

export const insertModelSchema = createInsertSchema(model, {
  parts: z.string().array(),
});

export const publicInsertModelSchema = insertModelSchema.pick({
  name: true,
  workspaceId: true,
  type: true,
  parts: true,
});

export const selectModelSchema = createSelectSchema(model, {
  parts: z.string().array(),
});
