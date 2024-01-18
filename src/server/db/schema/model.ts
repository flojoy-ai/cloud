import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspace } from "./workspace";
import { relations } from "drizzle-orm";
import { hardware } from ".";

export const model = pgTable(
  "model",
  {
    ...baseModal("model"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => ({
    modelNameIndex: index().on(table.name),
    unq: unique().on(table.workspaceId, table.name),
  }),
);

export const modelRelation = relations(model, ({ many }) => ({
  hardwares: many(hardware),
}));
