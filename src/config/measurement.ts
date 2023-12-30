export const measurementConfig = {
  supportedTypes: ["boolean", "dataframe", "image"],
} as const;

export type MeasurementConfig = typeof measurementConfig;

export type MeasurementType = MeasurementConfig["supportedTypes"][number];
