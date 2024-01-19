import { primaryKey, text } from "drizzle-orm/pg-core";
import { pgTable } from "./table";
import { system, device } from "./";

export const system_device = pgTable(
  "system_device",
  {
    systemId: text("system_id")
      .notNull()
      .references(() => system.id, { onDelete: "cascade" }),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.systemId, table.deviceId] }),
  }),
);
