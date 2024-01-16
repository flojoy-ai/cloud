import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspace } from "./workspace";
// import { measurement } from "./measurement";
import { baseModal, pgTable } from "./table";

// Each project can have a bunch of hardware devices registered to it.
export const system = pgTable(
  "system",
  {
    ...baseModal("system"),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    systemNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name),
  }),
);

export const systemRelation = relations(system, ({ one, many }) => ({
  // measurements: many(measurement),
  workspace: one(workspace, {
    fields: [system.workspaceId],
    references: [workspace.id],
  }),
}));
