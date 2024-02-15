export type MeasurementInputData = {
  hardwareId: string;
  testId: string;
  name: string;
  type: "boolean" | "dataframe";
  data: string;
  pass: boolean;
};
