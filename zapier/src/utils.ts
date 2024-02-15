import { MeasurementInputData } from "./types/measurement";

export const getMeasurementValueByType = (
  data: string,
  type: MeasurementInputData["type"],
) => {
  return type === "boolean"
    ? Boolean(data)
    : (JSON.parse(data) as Record<string, number[] | string[]>);
};
