import { baseModal, pgTable } from ".";
import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { project } from "./project";
import { measurement, measurementTypeEnum } from "./measurement";

// Each project can have multiple tests (not "software test").
export const test = pgTable(
  "test",
  {
    ...baseModal("test"),
    measurementType: measurementTypeEnum("measurement_type").notNull(),
    name: text("name").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (test) => ({
    testNameIndex: index().on(test.name),
    unq: unique().on(test.projectId, test.name),
  }),
);

export const testRelation = relations(test, ({ one, many }) => ({
  measurements: many(measurement),
  project: one(project, {
    fields: [test.projectId],
    references: [project.id],
  }),
}));
