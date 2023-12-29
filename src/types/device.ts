import { device } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectDevice = typeof device.$inferSelect;

export const insertDeviceSchema = createInsertSchema(device);
export const selectDeviceSchema = createSelectSchema(device);
