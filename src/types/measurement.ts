import { measurementDataSchema } from "~/types/data";
import {
  measurement,
  measurementInitializer,
} from "~/schemas/public/Measurement";
import { z } from "zod";
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
    name: z.string().default("Untitled Measurement"),
  });

export const selectMeasurementSchema = measurement.extend({
  hardware: hardware,
  data: measurementDataSchema,
});

export type SelectMeasurement = z.infer<typeof selectMeasurementSchema>;
