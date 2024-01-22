import {
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    modelNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name),
  }),
);

export const deviceModel = pgTable("device_model", {
  id: text("id")
    .primaryKey()
    .references(() => model.id, { onDelete: "cascade" }),
});

export const systemModel = pgTable("system_model", {
  id: text("id")
    .primaryKey()
    .references(() => model.id, { onDelete: "cascade" }),
});

export const systemModelDeviceModel = pgTable(
  "system_model_device_model",
  {
    systemModelId: text("system_model_id")
      .notNull()
      .references(() => systemModel.id, { onDelete: "cascade" }),
    deviceModelId: text("device_model_id")
      .notNull()
      .references(() => deviceModel.id, { onDelete: "cascade" }),
    count: integer("count").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.systemModelId, table.deviceModelId] }),
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
