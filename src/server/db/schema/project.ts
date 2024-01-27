import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { workspace } from "./workspace";
import { test } from "./test";
import { model } from ".";

// This table should be self-explanatory.
export const project = pgTable(
  "project",
  {
    ...baseModal("project"),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    modelId: text("model_id")
      .references(() => model.id, { onDelete: "restrict" })
      .notNull(),
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
  workspace: one(workspace, {
    fields: [project.workspaceId],
    references: [workspace.id],
  }),
  model: one(model, {
    fields: [project.modelId],
    references: [model.id],
  }),
}));
