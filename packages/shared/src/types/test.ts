import { t, Static } from "elysia";
import { measurementType } from "./measurement";

export type { Test } from "../schemas/public/Test";

export const numericMeasurementType = t.Extract(
  measurementType,
  t.Union([t.Literal("scalar")]),
);
export type NumericMeasurementType = Static<typeof numericMeasurementType>;

export const isNumericMeasurementType = (
  type: string,
): type is NumericMeasurementType => type === "scalar";

export const nonNumericMeasurementType = t.Exclude(
  measurementType,
  numericMeasurementType,
);
export type NonNumericMeasurementType = Static<
  typeof nonNumericMeasurementType
>;

const insertTestBase = t.Object({
  name: t.String({ minLength: 1 }),
  projectId: t.String(),
});

const insertNumericTest = t.Composite([
  insertTestBase,
  t.Object({
    measurementType: numericMeasurementType,
    unit: t.Optional(t.String()),
  }),
]);

const insertNonNumericTest = t.Composite([
  insertTestBase,
  t.Object({
    measurementType: nonNumericMeasurementType,
  }),
]);

const insertTest = t.Union([insertNumericTest, insertNonNumericTest]);

export type InsertTest = Static<typeof insertTest>;
