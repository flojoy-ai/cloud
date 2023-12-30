import { z } from "zod";
import { measurementConfig } from "~/config/measurement";

export const measurementDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("boolean"),
    data: measurementConfig.boolean,
  }),
  z.object({
    type: z.literal("image"),
    data: measurementConfig.image,
  }),
  z.object({
    type: z.literal("dataframe"),
    data: measurementConfig.dataframe,
  }),
]);

export type MeasurementData = z.infer<typeof measurementDataSchema>;
