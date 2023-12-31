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

const genTypeWithErrMsg = (type: string) =>
  z.literal(type, {
    errorMap: () => ({
      message:
        "The `type` field is reserved for Flojoy Cloud. You should not provide a value for this field.",
    }),
  });

// Step 4: Add to this discriminated union
export const measurementDataSchema = z.discriminatedUnion("type", [
  z.object({
    ...measurementConfig.boolean,
    type: genTypeWithErrMsg("boolean"),
  }),
  z.object({
    ...measurementConfig.image,
    type: genTypeWithErrMsg("image"),
  }),
  z.object({
    ...measurementConfig.dataframe,
    type: genTypeWithErrMsg("dataframe"),
  }),
]);

export type MeasurementData = z.infer<typeof measurementDataSchema>;
