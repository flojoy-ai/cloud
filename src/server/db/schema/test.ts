import { baseModal, pgTable } from "./table";
import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projectTable } from "./project";
import { measurementTable } from "./measurement";
import { allMeasurementDataTypes } from "~/types/data";

// Each project can have multiple tests (not "software test").
export const testTable = pgTable(
  "test",
  {
    ...baseModal("test"),
    measurementType: text("measurement_type", {
      enum: allMeasurementDataTypes,
    }).notNull(),
    name: text("name").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    testNameIndex: index().on(table.name),
    unq: unique().on(table.projectId, table.name),
  }),
);

export const testRelation = relations(testTable, ({ one, many }) => ({
  measurements: many(measurementTable),
  project: one(projectTable, {
    fields: [testTable.projectId],
    references: [projectTable.id],
  }),
}));
