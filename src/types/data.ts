import { z } from "zod";

// Step 1: Add the measurement name here
export const allMeasurementDataTypes = ["boolean", "dataframe"] as const;

export type MeasurementDataType = (typeof allMeasurementDataTypes)[number];

// Step 2: Create a schema for the newly added measurement type
const booleanDataSchema = {
  passed: z.boolean(),
};

const dataframeDataSchema = {
  dataframe: z.record(
    z.string(),
    // TODO: technically the array can also contain nulls
    z.union([z.number().array(), z.string().array()]),
  ),
};

// Step 3: Add to this config object
export const measurementConfig = {
  boolean: booleanDataSchema,
  dataframe: dataframeDataSchema,
} as const satisfies Record<MeasurementDataType, unknown>;

// Step 4: Add to this discriminated union
export const measurementDataSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("boolean", {
        errorMap: () => ({
          message:
            "The `type` field is reserved for Flojoy Cloud. You should not provide a value for this field.",
        }),
      }),
    })
    .extend(measurementConfig.boolean),
  z
    .object({
      type: z.literal("dataframe", {
        errorMap: () => ({
          message:
            "The `type` field is reserved for Flojoy Cloud. You should not provide a value for this field.",
        }),
      }),
    })
    .extend(measurementConfig.dataframe),
]);

export type MeasurementData = z.infer<typeof measurementDataSchema>;

const booleanExplorerSchema = z.object({
  xAxis: z.union([z.literal("timestamp"), z.literal("device_id")]),
});

const dataframeExplorerSchema = z.object({
  upperControlLimit: z.number().optional(),
  lowerControlLimit: z.number().optional(),
  yTransform: z.string().optional(),
  upperControlLimitTransform: z.string().optional(),
  lowerControlLimitTransform: z.string().optional(),
  logScaleYAxis: z.boolean().optional(),
  errorBars: z.boolean().optional(),
  errorPercentage: z.number().min(0).optional(),
});

export const explorerConfig = {
  boolean: booleanExplorerSchema,
  dataframe: dataframeExplorerSchema,
} as const satisfies Record<MeasurementDataType, unknown>;
