import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from ".";
import { workspace } from "./workspace";
import { test } from "./test";
import { project_device } from "./device";

// This table should be self-explanatory.
export const project = pgTable(
  "project",
  {
    ...baseModal("project"),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (project) => ({
    projectNameIndex: index().on(project.name),
    unq: unique().on(project.workspaceId, project.name),
  }),
);

export const projectRelation = relations(project, ({ many, one }) => ({
  tests: many(test),
  projects_devices: many(project_device),
  workspace: one(workspace, {
    fields: [project.workspaceId],
    references: [workspace.id],
  }),
}));
