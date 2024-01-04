import * as math from "mathjs";
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
    z.number().array(),
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

const exprValidator = (varName: string) => (expr: string | undefined) => {
  if (!expr) return true;

  let valid = true;
  try {
    math.parse(expr).traverse((node) => {
      if (node.type !== "SymbolNode") return;
      const symbolNode = node as math.SymbolNode;

      if (
        !math[symbolNode.name as keyof typeof math] &&
        symbolNode.name !== varName
      ) {
        valid = false;
      }
    });
  } catch (e) {
    return false;
  }

  return valid;
};

const dataframeExplorerSchema = z.object({
  upperControlLimit: z.number().optional(),
  lowerControlLimit: z.number().optional(),
  yTransform: z
    .string()
    .optional()
    .refine(exprValidator("y"), "Expression must be a function of y"),
  upperControlLimitTransform: z
    .string()
    .optional()
    .refine(exprValidator("x"), "Expression must be a function of x"),
  lowerControlLimitTransform: z
    .string()
    .optional()
    .refine(exprValidator("x"), "Expression must be a function of x"),
  logScaleYAxis: z.boolean().optional(),
  errorBars: z.boolean().optional(),
  errorPercentage: z.number().min(0).optional(),
  xColumn: z.string().optional(),
  yColumn: z.string().optional(),
});

export const explorerConfig = {
  boolean: booleanExplorerSchema,
  dataframe: dataframeExplorerSchema,
} as const satisfies Record<MeasurementDataType, unknown>;
