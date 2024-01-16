import {
  index,
  text,
  timestamp,
  pgEnum,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { allMeasurementDataTypes, type MeasurementData } from "~/types/data";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { device } from "./device";
import { test } from "./test";

export const measurementTypeEnum = pgEnum(
  "measurement_type",
  allMeasurementDataTypes,
);

// A measurement from a device that is associated with a test.
// The is_deleted field is used to soft-delete a measurement.
export const storageProviderEnum = pgEnum("storage_provider", ["s3", "local"]);

export const measurement = pgTable(
  "measurement",
  {
    isDeleted: boolean("is_deleted").default(false),
    // TODO: this needs a bit more thought, would be nice to make it more structured
    data: jsonb("data").$type<MeasurementData>().notNull(),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
    ...baseModal("measurement"),
    measurementType: measurementTypeEnum("measurement_type").notNull(),
    name: text("name").default("Untitled"),
    storageProvider: storageProviderEnum("storage_provider").notNull(),
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
}));
