export type MeasurementInputData = {
  unitId: string;
  testId: string;
  name: string;
  type: MeasurementDataType;
  data: string;
  pass: boolean;
};

export type MeasurementDataType = "boolean" | "dataframe";
