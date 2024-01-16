import { index, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { allMeasurementDataTypes, type MeasurementData } from "~/types/data";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { device } from "./device";
import { test } from "./test";
import { system } from "./system";

export const measurement = pgTable(
  "measurement",
  {
    isDeleted: boolean("is_deleted").default(false),
    // TODO: this needs a bit more thought, would be nice to make it more structured
    data: jsonb("data").$type<MeasurementData>().notNull(),
    deviceId: text("device_id").references(() => device.id, {
      onDelete: "cascade",
    }),
    ...baseModal("measurement"),
    systemId: text("system_id").references(() => device.id, {
      onDelete: "cascade",
    }),
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
    measurementDeviceIdIndex: index().on(measurement.deviceId),
    measurementTestIdIndex: index().on(measurement.testId),
  }),
);

export const measurementRelation = relations(measurement, ({ one }) => ({
  test: one(test, {
    fields: [measurement.testId],
    references: [test.id],
  }),
  device: one(device, {
    fields: [measurement.deviceId],
    references: [device.id],
  }),
  system: one(system, {
    fields: [measurement.systemId],
    references: [system.id],
  }),
}));
