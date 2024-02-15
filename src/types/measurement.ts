import { measurementDataSchema } from "~/types/data";
import {
  measurement,
  measurementInitializer,
} from "~/schemas/public/Measurement";
import { z } from "zod";
import { hardware } from "~/schemas/public/Hardware";
import { tag } from "~/schemas/public/Tag";

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
    tagNames: z.string().array().default([]),
  });

export const selectMeasurementSchema = measurement.extend({
  hardware: hardware,
  data: measurementDataSchema,
  tags: z.array(tag),
});

export type SelectMeasurement = z.infer<typeof selectMeasurementSchema>;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
