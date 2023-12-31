import { z } from "zod";

// Step 1: Add the measurement name here
export const allMeasurementTypes = ["boolean", "image", "dataframe"] as const;

export type MeasurementType = (typeof allMeasurementTypes)[number];

// Step 2: Create a schema for the newly added measurement type
const booleanMeasurementSchema = {
  passed: z.boolean(),
};

const imageMeasurementSchema = {
  s3Key: z.string(),
  s3Bucket: z.string(),
};

const dataframeMeasurementSchema = {
  s3Key: z.string(),
  s3Bucket: z.string(),
};

// Step 3: Add to this config object
export const measurementConfig = {
  boolean: booleanMeasurementSchema,
  image: imageMeasurementSchema,
  dataframe: dataframeMeasurementSchema,
} as const satisfies Record<MeasurementType, unknown>;

// Step 4: Add to this discriminated union
export const measurementDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("boolean"),
    ...measurementConfig.boolean,
  }),
  z.object({
    type: z.literal("image"),
    ...measurementConfig.image,
  }),
  z.object({
    type: z.literal("dataframe"),
    ...measurementConfig.dataframe,
  }),
]);

export type MeasurementData = z.infer<typeof measurementDataSchema>;
