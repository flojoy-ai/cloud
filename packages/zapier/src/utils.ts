import { MeasurementDataType } from "./types/measurement";

const dataParseMethods: {
  [key in MeasurementDataType]: (data: string) => any;
} = {
  boolean: (data) => Boolean(data),
  dataframe: (data) => JSON.parse(data),
};

export const getMeasurementValueByType = (
  data: string,
  type: MeasurementDataType,
) => {
  return dataParseMethods[type](data);
};
