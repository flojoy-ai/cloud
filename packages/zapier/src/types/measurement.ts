export type MeasurementInputData = {
  hardwareId: string;
  testId: string;
  name: string;
  type: MeasurementDataType;
  data: string;
  pass: boolean;
};

export type MeasurementDataType = "boolean" | "dataframe";
