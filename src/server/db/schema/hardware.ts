import {
  index,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspaceTable } from "./workspace";
import { relations } from "drizzle-orm";
import { measurementTable, modelTable } from ".";

export const hardwareTable = pgTable(
  "hardware",
  {
    ...baseModal("hardware"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    modelId: text("model_id")
      .references(() => modelTable.id, { onDelete: "restrict" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    hardwareNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name, table.modelId),
  }),
);

export const deviceTable = pgTable("device", {
  id: text("id")
    .primaryKey()
    .references(() => hardwareTable.id, { onDelete: "cascade" }),
});

export const systemTable = pgTable("system", {
  id: text("id")
    .primaryKey()
    .references(() => hardwareTable.id, { onDelete: "cascade" }),
});

export const systemDeviceTable = pgTable(
  "system_device",
  {
    systemId: text("system_id")
      .notNull()
      .references(() => systemTable.id, { onDelete: "cascade" }),
    deviceId: text("device_id")
      .notNull()
      .references(() => deviceTable.id, {
        onDelete: "restrict",
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.systemId, table.deviceId] }),
  }),
);

export const hardwareRelation = relations(hardwareTable, ({ one, many }) => ({
  measurements: many(measurementTable),
  workspace: one(workspaceTable, {
    fields: [hardwareTable.workspaceId],
    references: [workspaceTable.id],
  }),
  model: one(modelTable, {
    fields: [hardwareTable.modelId],
    references: [modelTable.id],
  }),
}));
