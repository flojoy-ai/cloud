import { Static, t } from "elysia";
import type { Measurement as SchemaMeasurement } from "../schemas/public/Measurement";

export type Measurement = Omit<SchemaMeasurement, "data"> & {
  data: MeasurementData;
};

// export type { Measurement } from "../schemas/public/Measurement";

// Step 1: Add the measurement name here
export const allMeasurementDataTypes = [
  "boolean",
  "dataframe",
  "scalar",
] as const;

export const measurementType = t.Union([
  t.Literal("boolean"),
  t.Literal("dataframe"),
  t.Literal("scalar"),
]);

export type MeasurementDataType = Static<typeof measurementType>;

// Step 2: Create a schema for the newly added measurement type
const booleanData = t.Object({
  type: t.Literal("boolean"),
  value: t.Boolean(),
});

export type BooleanData = Static<typeof booleanData>;

const dataframeData = t.Object({
  type: t.Literal("dataframe"),
  value: t.Record(
    t.String(),
    // TODO: technically the array can also contain nulls
    t.Union([t.Array(t.Number()), t.Array(t.String())]),
  ),
});

export type DataframeData = Static<typeof dataframeData>;

const scalarData = t.Object({
  type: t.Literal("scalar"),
  value: t.Number(),
});

export type ScalarData = Static<typeof scalarData>;

// // Step 3: Add to this config object
// export const measurementConfig = {
//   boolean: booleanDataSchema,
//   dataframe: dataframeDataSchema,
//   scalar: scalarDataSchema,
// } as const satisfies Record<MeasurementDataType, unknown>;

export const measurementData = t.Union([
  booleanData,
  dataframeData,
  scalarData,
]);

export type MeasurementData = Static<typeof measurementData>;

export const insertMeasurement = t.Object({
  unitId: t.String(),
  testId: t.String(),
  sessionId: t.Optional(t.String()),
  sequenceName: t.Optional(t.String()),
  cycleNumber: t.Optional(t.Integer()),
  projectId: t.String(),
  name: t.String({ default: "Untitled measurement" }),
  data: measurementData,
  pass: t.Nullable(t.Boolean()),
  createdAt: t.Date(),
  durationMs: t.Integer({ default: 0 }),
  tagNames: t.Array(t.String(), { default: [] }),
});

export type InsertMeasurement = Static<typeof insertMeasurement>;

export const sessionMeasurement = t.Object({
  testId: t.String(),
  sequenceName: t.Optional(t.String()),
  cycleNumber: t.Optional(t.Integer()),
  name: t.String({ default: "Untitled measurement" }),
  data: measurementData,
  pass: t.Nullable(t.Boolean()),
  durationMs: t.Integer(),
  createdAt: t.Date(),
});

export type SessionMeasurement = Static<typeof sessionMeasurement>;

// const booleanExplorerSchema = z.object({
//   xAxis: z.union([z.literal("timestamp"), z.literal("device_id")]),
// });
//
// const exprValidator = (varName: string) => (expr: string | undefined) => {
//   if (!expr) return true;
//
//   let valid = true;
//   try {
//     math.parse(expr).traverse((node) => {
//       if (node.type !== "SymbolNode") return;
//       const symbolNode = node as math.SymbolNode;
//
//       if (
//         !math[symbolNode.name as keyof typeof math] &&
//         symbolNode.name !== varName
//       ) {
//         valid = false;
//       }
//     });
//   } catch (e) {
//     return false;
//   }
//
//   return valid;
// };
//
// const traceSchema = z.object({
//   yAxisColumn: z.string().optional(),
//   mode: z.union([z.literal("lines"), z.literal("markers")]),
// });
//
// const dataframeExplorerSchema = z.object({
//   xAxisColumn: z.string(),
//   traces: z.array(traceSchema),
//   upperControlLimit: z.number().optional(),
//   lowerControlLimit: z.number().optional(),
//   yTransform: z
//     .string()
//     .optional()
//     .refine(exprValidator("y"), "Expression must be a function of y"),
//   upperControlLimitTransform: z
//     .string()
//     .optional()
//     .refine(exprValidator("x"), "Expression must be a function of x"),
//   lowerControlLimitTransform: z
//     .string()
//     .optional()
//     .refine(exprValidator("x"), "Expression must be a function of x"),
//   logScaleYAxis: z.boolean().optional(),
//   errorBars: z.boolean().optional(),
//   errorPercentage: z.number().min(0).optional(),
// });
//
// export const explorerConfig = {
//   boolean: booleanExplorerSchema,
//   dataframe: dataframeExplorerSchema,
//   scalar: z.object({}),
// } as const satisfies Record<MeasurementDataType, unknown>;
