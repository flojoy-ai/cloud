import { index, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { projectTable } from "./project";
import { hardwareTable } from ".";

// Upon creating a Flojoy Cloud account, the user will be prompted to
// create a workspace. (This can be a part of the singup wizard like mentioned
// in the comment above).
export const workspaceTable = pgTable(
  "workspace",
  {
    ...baseModal("workspace"),
    name: text("name").notNull(),
    namespace: text("namespace").notNull().unique(),
    planType: text("plan_type", {
      enum: ["hobby", "pro", "enterprise"],
    }).notNull(),
    totalSeats: integer("total_seats").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (workspace) => ({
    workspaceNamespaceIndex: index().on(workspace.namespace),
  }),
);

export const workspaceRelation = relations(workspaceTable, ({ many }) => ({
  projects: many(projectTable),
  hardwares: many(hardwareTable),
}));
