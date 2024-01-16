import { primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { project } from "./project";
import { pgTable } from "./table";
import { device } from "./device";

export const project_device = pgTable(
  "project_device",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.deviceId] }),
  }),
);
