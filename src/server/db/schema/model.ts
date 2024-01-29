import {
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspaceTable } from "./workspace";
import { relations } from "drizzle-orm";
import { hardwareTable, projectTable } from ".";

export const modelTable = pgTable(
  "model",
  {
    ...baseModal("model"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    modelNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name),
  }),
);

export const deviceModelTable = pgTable("device_model", {
  id: text("id")
    .primaryKey()
    .references(() => modelTable.id, { onDelete: "cascade" }),
});

export const systemModelTable = pgTable("system_model", {
  id: text("id")
    .primaryKey()
    .references(() => modelTable.id, { onDelete: "cascade" }),
});

export const systemModelDeviceModelTable = pgTable(
  "system_model_device_model",
  {
    systemModelId: text("system_model_id")
      .notNull()
      .references(() => systemModelTable.id, { onDelete: "cascade" }),
    deviceModelId: text("device_model_id")
      .notNull()
      .references(() => deviceModelTable.id, {
        onDelete: "restrict", // cannot delete a device model if it is in a system model
      }),
    count: integer("count").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.systemModelId, table.deviceModelId] }),
  }),
);

export const modelRelation = relations(modelTable, ({ many, one }) => ({
  hardwares: many(hardwareTable),
  projects: many(projectTable),
  workspace: one(workspaceTable, {
    fields: [modelTable.workspaceId],
    references: [workspaceTable.id],
  }),
}));
