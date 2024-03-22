import { t, Static } from "elysia";

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

export type MeasurementType = Static<typeof measurementType>;
