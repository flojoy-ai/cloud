import {
  index,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { workspaceTable } from "./workspace";
import { testTable } from "./test";
import { hardwareTable, modelTable } from ".";

export const projectTable = pgTable(
  "project",
  {
    ...baseModal("project"),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    modelId: text("model_id")
      .references(() => modelTable.id, { onDelete: "restrict" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (project) => ({
    projectNameIndex: index().on(project.name),
    unq: unique().on(project.workspaceId, project.name),
  }),
);

export const projectHardwareTable = pgTable(
  "project_hardware",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, { onDelete: "cascade" }),
    hardwareId: text("hardware_id")
      .notNull()
      .references(() => hardwareTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.hardwareId] }),
  }),
);

export const projectRelation = relations(projectTable, ({ many, one }) => ({
  tests: many(testTable),
  workspace: one(workspaceTable, {
    fields: [projectTable.workspaceId],
    references: [workspaceTable.id],
  }),
  model: one(modelTable, {
    fields: [projectTable.modelId],
    references: [modelTable.id],
  }),
}));
