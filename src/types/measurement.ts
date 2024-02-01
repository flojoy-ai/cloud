import { measurementTable } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { measurementDataSchema } from "~/types/data";
import { type SelectHardware } from "./hardware";

export type SelectMeasurement = typeof measurementTable.$inferSelect;

export type InsertMeasurement = typeof measurementTable.$inferSelect;

export type MeasurementWithHardware = SelectMeasurement & {
  hardware: SelectHardware;
};

export const insertMeasurementSchema = createInsertSchema(measurementTable, {
  data: measurementDataSchema,
});
export const publicInsertMeasurementSchema = insertMeasurementSchema.pick({
  name: true,
  pass: true,
  data: true,
  hardwareId: true,
  testId: true,
  createdAt: true,
});

export const selectMeasurementSchema = createSelectSchema(measurementTable, {
  data: measurementDataSchema,
});
