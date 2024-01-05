import { secret } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectSecret = typeof secret.$inferSelect;
export type InsertSecret = typeof secret.$inferSelect;

export const insertSecretSchema = createInsertSchema(secret);
export const publicInsertSecretSchema = insertSecretSchema.pick({
  workspaceId: true,
});

export const selectSecretSchema = createSelectSchema(secret);
