import { index, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { type MeasurementData } from "~/types/data";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { test } from "./test";
import { hardware } from "./hardware";

export const measurement = pgTable(
  "measurement",
  {
    ...baseModal("measurement"),
    name: text("name").default("Untitled"),
    data: jsonb("data").$type<MeasurementData>().notNull(),
    hardwareId: text("hardware_id")
      .references(() => hardware.id, {
        onDelete: "cascade",
      })
      .notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => test.id, { onDelete: "cascade" }),
    storageProvider: text("storage_provider", {
      enum: ["s3", "postgres"],
    }).notNull(),
    images: jsonb("images").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isDeleted: boolean("is_deleted").default(false),
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
