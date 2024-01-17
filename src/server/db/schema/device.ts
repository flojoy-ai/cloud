import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { measurement } from "./measurement";
import { pgTable } from "./table";
import { hardware } from "./hardware";

// Each project can have a bunch of hardware devices registered to it.
export const device = pgTable(
  "device",
  {
    hardwareId: text("hardware_id")
      .references(() => hardware.id, {
        onDelete: "cascade",
      })
      .primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    deviceNameIndex: index().on(table.name),
    unq: unique().on(table.hardwareId, table.name),
  }),
);

export const deviceRelation = relations(device, ({ one, many }) => ({
  measurements: many(measurement),
  hardware: one(hardware, {
    fields: [device.hardwareId],
    references: [hardware.id],
  }),
}));
