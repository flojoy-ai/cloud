import { measurementDataSchema } from "~/types/data";
import { selectHardware } from "./hardware";
import {
  measurement,
  measurementInitializer,
} from "~/schemas/public/Measurement";
import { type z } from "zod";

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
  hardware: selectHardware,
});

export type SelectMeasurement = z.infer<typeof selectMeasurementSchema>;
