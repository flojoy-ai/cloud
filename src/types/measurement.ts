import { measurement } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectMeasurement = typeof measurement.$inferSelect;

export const insertMeasurementSchema = createInsertSchema(measurement);
export const selectMeasurementSchema = createSelectSchema(measurement);
