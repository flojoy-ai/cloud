import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspace } from "./workspace";
import { relations } from "drizzle-orm";
import { measurement, model } from ".";

export const hardware = pgTable(
  "hardware",
  {
    ...baseModal("hardware"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    modelId: text("model_id")
      .references(() => model.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    hardwareNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name),
  }),
);

export const hardwareRelation = relations(hardware, ({ one, many }) => ({
  measurements: many(measurement),
  workspace: one(workspace, {
    fields: [hardware.workspaceId],
    references: [workspace.id],
  }),
  model: one(model, {
    fields: [hardware.modelId],
    references: [model.id],
  }),
}));