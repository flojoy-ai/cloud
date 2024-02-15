import { MeasurementInputData } from "./types/measurement";

const dataParseMethods: {
  [key in MeasurementInputData["type"]]: (data: string) => any;
} = {
  boolean: (data) => Boolean(data),
  dataframe: (data) => JSON.parse(data),
};

export const getMeasurementValueByType = (
  data: string,
  type: MeasurementInputData["type"],
) => {
  return dataParseMethods[type](data);
};
