import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspace } from "./workspace";
import { measurement } from "./measurement";
import { project } from "./project";
import { baseModal, pgTable } from "./table";

// Each project can have a bunch of hardware devices registered to it.
export const device = pgTable(
  "device",
  {
    ...baseModal("device"),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (device) => ({
    deviceNameIndex: index().on(device.name),
    unq: unique().on(device.workspaceId, device.name),
  }),
);

export const deviceRelation = relations(device, ({ one, many }) => ({
  measurements: many(measurement),
  projects_devices: many(project_device),
  workspace: one(workspace, {
    fields: [device.workspaceId],
    references: [workspace.id],
  }),
}));

export const project_device = pgTable(
  "project_device",
  {
    ...baseModal("project_device"),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (project_device) => ({
    projectDeviceProjectIdDeviceIdIndex: index().on(
      project_device.projectId,
      project_device.deviceId,
    ),
    projectDeviceProjectIdIndex: index().on(project_device.projectId),
    projectDeviceDeviceIdIndex: index().on(project_device.deviceId),
    unq: unique().on(project_device.projectId, project_device.deviceId),
  }),
);

export const projectDeviceRelation = relations(project_device, ({ many }) => ({
  devices: many(device),
  projects: many(project),
}));
