import { measurement } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { measurementDataSchema } from "~/types/data";

export type SelectMeasurement = typeof measurement.$inferSelect;

export type InsertMeasurement = typeof measurement.$inferSelect;

export const insertMeasurementSchema = createInsertSchema(measurement, {
  data: measurementDataSchema,
});
export const publicInsertMeasurementSchema = insertMeasurementSchema.pick({
  name: true,
  data: true,
  hardwareId: true,
  measurementType: true,
  testId: true,
  createdAt: true,
});

export const selectMeasurementSchema = createSelectSchema(measurement, {
  data: measurementDataSchema,
});
