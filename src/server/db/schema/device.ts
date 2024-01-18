import { text } from "drizzle-orm/pg-core";
import { pgTable } from "./table";
// import { relations } from "drizzle-orm";
import { hardware } from ".";

export const device = pgTable(
  "device",
  {
    hardwareId: text("hardware_id")
      .primaryKey()
      .references(() => hardware.id, { onDelete: "cascade" }),
  },
  // (table) => ({}),
);

// export const deviceRelation = relations(device, ({ one, many }) => ({}));
