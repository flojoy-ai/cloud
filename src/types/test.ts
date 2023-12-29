import { test } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectTest = typeof test.$inferSelect;

export const insertTestSchema = createInsertSchema(test);
export const selectTestSchema = createSelectSchema(test);
