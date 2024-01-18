import { measurement } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { measurementDataSchema } from "~/types/data";
import { type SelectDevice } from "./device";
import { type SelectTest } from "./test";

export type SelectMeasurement = typeof measurement.$inferSelect;

export type InsertMeasurement = typeof measurement.$inferSelect;

export type MeasurementWithDeviceAndTest = SelectMeasurement & {
  device: SelectDevice;
  test: SelectTest;
};

export const insertMeasurementSchema = createInsertSchema(measurement, {
  data: measurementDataSchema,
});
export const publicInsertMeasurementSchema = insertMeasurementSchema.pick({
  name: true,
  data: true,
  deviceId: true,
  measurementType: true,
  testId: true,
  createdAt: true,
});

export const selectMeasurementSchema = createSelectSchema(measurement, {
  data: measurementDataSchema,
});
