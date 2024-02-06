// import { measurementTable } from "~/server/db/schema";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import { measurementDataSchema } from "~/types/data";
// import { type SelectHardware } from "./hardware";
// import { measurementInitializer } from "~/schemas/public/Measurement";
//
// export type MeasurementWithHardware = SelectMeasurement & {
//   hardware: SelectHardware;
// };
//
// export const insertMeasurementSchema = measurementInitializer
//   .pick({
//     name: true,
//     data: true,
//     pass: true,
//     hardwareId: true,
//     testId: true,
//     createdAt: true,
//   })
//   .extend({
//     data: measurementDataSchema,
//   });
//
// export const selectMeasurementSchema = createSelectSchema(measurementTable, {
//   data: measurementDataSchema,
// });
