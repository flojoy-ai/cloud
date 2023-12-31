import { z } from "zod";

// Step 1: Add the measurement name here
export const allMeasurementDataTypes = [
  "boolean",
  "image",
  "dataframe",
] as const;

export type MeasurementDataType = (typeof allMeasurementDataTypes)[number];

// Step 2: Create a schema for the newly added measurement type
const booleanDataSchema = {
  passed: z.boolean(),
};

const imageDataSchema = {
  s3Key: z.string(),
  s3Bucket: z.string(),
};

const dataframeDataSchema = {
  s3Key: z.string(),
  s3Bucket: z.string(),
};

// Step 3: Add to this config object
export const measurementConfig = {
  boolean: booleanDataSchema,
  image: imageDataSchema,
  dataframe: dataframeDataSchema,
} as const satisfies Record<MeasurementDataType, unknown>;

// Step 4: Add to this discriminated union
export const measurementDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("boolean", {
      errorMap: () => ({
        message:
          "The `type` field is reserved for Flojoy Cloud. You should not provide a value for this field.",
      }),
    }),
    ...measurementConfig.boolean,
  }),
  z.object({
    type: z.literal("image", {
      errorMap: () => ({
        message:
          "The `type` field is reserved for Flojoy Cloud. You should not provide a value for this field.",
      }),
    }),
    ...measurementConfig.image,
  }),
  z.object({
    type: z.literal("dataframe", {
      errorMap: () => ({
        message:
          "The `type` field is reserved for Flojoy Cloud. You should not provide a value for this field.",
      }),
    }),
    ...measurementConfig.dataframe,
  }),
]);

export type MeasurementData = z.infer<typeof measurementDataSchema>;
