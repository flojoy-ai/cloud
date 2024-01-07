import { test } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectTest = typeof test.$inferSelect;

export const insertTestSchema = createInsertSchema(test);

export const publicInsertTestSchema = insertTestSchema.pick({
  name: true,
  projectId: true,
  measurementType: true,
});
export const selectTestSchema = createSelectSchema(test);
