import { index, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { allMeasurementDataTypes, type MeasurementData } from "~/types/data";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { test } from "./test";
import { hardware } from "./hardware";

export const measurement = pgTable(
  "measurement",
  {
    isDeleted: boolean("is_deleted").default(false),
    // TODO: this needs a bit more thought, would be nice to make it more structured
    data: jsonb("data").$type<MeasurementData>().notNull(),
    hardwareId: text("hardware_id")
      .references(() => hardware.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...baseModal("measurement"),
    measurementType: text("measurement_type", {
      enum: allMeasurementDataTypes,
    }).notNull(),
    name: text("name").default("Untitled"),
    storageProvider: text("storage_provider", {
      enum: ["s3", "postgres"],
    }).notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => test.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (measurement) => ({
    measurementNameIndex: index().on(measurement.name),
    measurementHardwareIdIndex: index().on(measurement.hardwareId),
    measurementTestIdIndex: index().on(measurement.testId),
  }),
);

export const measurementRelation = relations(measurement, ({ one }) => ({
  test: one(test, {
    fields: [measurement.testId],
    references: [test.id],
  }),
  hardware: one(hardware, {
    fields: [measurement.hardwareId],
    references: [hardware.id],
  }),
}));
