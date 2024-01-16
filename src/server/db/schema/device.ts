import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspace } from "./workspace";
import { measurement } from "./measurement";
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
  workspace: one(workspace, {
    fields: [device.workspaceId],
    references: [workspace.id],
  }),
}));
