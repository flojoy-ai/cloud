import { device } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectDevice = typeof device.$inferSelect;

export const insertDeviceSchema = createInsertSchema(device);

export const publicInsertDeviceSchema = insertDeviceSchema.pick({
  name: true,
  projectId: true,
});

export const selectDeviceSchema = createSelectSchema(device);
