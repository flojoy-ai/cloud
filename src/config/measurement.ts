import { z } from "zod";

const booleanMeasurementSchema = z.object({
  passed: z.boolean(),
});

const imageMeasurementSchema = z.object({
  s3Key: z.string(),
  s3Bucket: z.string(),
});

const dataframeMeasurementSchema = z.object({
  s3Key: z.string(),
  s3Bucket: z.string(),
});

export const measurementConfig = {
  boolean: booleanMeasurementSchema,
  image: imageMeasurementSchema,
  dataframe: dataframeMeasurementSchema,
};

export const allMeasurementTypes = ["boolean", "image", "dataframe"] as const;

export type MeasurementType = keyof typeof measurementConfig;

export type MeasurementConfig = typeof measurementConfig;
