import { index, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { type MeasurementData } from "~/types/data";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { testTable } from "./test";
import { hardwareTable } from "./hardware";

export const measurementTable = pgTable(
  "measurement",
  {
    ...baseModal("measurement"),
    name: text("name").default("Untitled"),
    data: jsonb("data").$type<MeasurementData>().notNull(),
    hardwareId: text("hardware_id")
      .references(() => hardwareTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    testId: text("test_id")
      .notNull()
      .references(() => testTable.id, { onDelete: "cascade" }),
    storageProvider: text("storage_provider", {
      enum: ["s3", "postgres"],
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    isDeleted: boolean("is_deleted").default(false),
  },
  (measurement) => ({
    measurementNameIndex: index().on(measurement.name),
    measurementHardwareIdIndex: index().on(measurement.hardwareId),
    measurementTestIdIndex: index().on(measurement.testId),
  }),
);

export const measurementRelation = relations(measurementTable, ({ one }) => ({
  test: one(testTable, {
    fields: [measurementTable.testId],
    references: [testTable.id],
  }),
  hardware: one(hardwareTable, {
    fields: [measurementTable.hardwareId],
    references: [hardwareTable.id],
  }),
}));
