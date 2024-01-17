import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgTable } from "./table";
import { hardware } from "./hardware";

// Each project can have a bunch of hardware devices registered to it.
export const system = pgTable(
  "system",
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
    systemNameIndex: index().on(table.name),
    unq: unique().on(table.hardwareId, table.name),
  }),
);

export const systemRelation = relations(system, ({ one, many }) => ({
  // measurements: many(measurement),
  // workspace: one(workspace, {
  //   fields: [system.workspaceId],
  //   references: [workspace.id],
  // }),
}));
