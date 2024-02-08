import { measurementDataSchema } from "~/types/data";
import {
  measurement,
  measurementInitializer,
} from "~/schemas/public/Measurement";
import { type z } from "zod";
import { hardware } from "~/schemas/public/Hardware";

export const insertMeasurementSchema = measurementInitializer
  .pick({
    name: true,
    data: true,
    pass: true,
    hardwareId: true,
    testId: true,
    createdAt: true,
  })
  .extend({
    data: measurementDataSchema,
  });

export const selectMeasurementSchema = measurement.extend({
  hardware: hardware,
});

export type SelectMeasurement = z.infer<typeof selectMeasurementSchema>;
