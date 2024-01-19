import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspace } from "./workspace";
import { relations } from "drizzle-orm";
import { hardware, project } from ".";

export const model = pgTable(
  "model",
  {
    ...baseModal("model"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: ["device", "system"] }).notNull(),
    // Device parts if it is a system
    // TODO: Find a good way to get the part names in queries?
    parts: text("parts").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    modelNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name),
  }),
);

export const modelRelation = relations(model, ({ many, one }) => ({
  hardwares: many(hardware),
  projects: many(project),
  workspace: one(workspace, {
    fields: [model.workspaceId],
    references: [workspace.id],
  }),
}));
