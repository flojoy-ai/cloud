import { secretTable } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectSecret = typeof secretTable.$inferSelect;
export type InsertSecret = typeof secretTable.$inferSelect;

export const insertSecretSchema = createInsertSchema(secretTable);
export const publicInsertSecretSchema = insertSecretSchema.pick({
  workspaceId: true,
});

export const selectSecretSchema = createSelectSchema(secretTable);
