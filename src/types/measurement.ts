import { measurement } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectMeasurement = typeof measurement.$inferSelect;

export type InsertMeasurement = typeof measurement.$inferSelect;

export const insertMeasurementSchema = createInsertSchema(measurement);
export const publicInsertMeasurementSchema = insertMeasurementSchema.pick({
  name: true,
  data: true,
  deviceId: true,
  measurementType: true,
  testId: true,
});

export const selectMeasurementSchema = createSelectSchema(measurement);
