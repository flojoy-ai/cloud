import { measurement } from "~/server/db/schema";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectMeasurement = typeof measurement.$inferSelect;

export const insertMeasurementSchema = createInsertSchema(measurement, {
  // TODO: this is a drizzle bug, waiting for fix
  // https://github.com/drizzle-team/drizzle-orm/issues/1110
  // https://github.com/drizzle-team/drizzle-orm/issues/1609
  tags: z.array(z.string()).default([]),
});
export const selectMeasurementSchema = createSelectSchema(measurement);
