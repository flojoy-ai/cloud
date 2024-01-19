import { hardware } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectHardware = typeof hardware.$inferSelect;

export const insertHardwareSchema = createInsertSchema(hardware);

export const publicInsertHardwareSchema = insertHardwareSchema.pick({
  name: true,
  workspaceId: true,
  modelId: true,
});

export const selectHardwareSchema = createSelectSchema(hardware);
