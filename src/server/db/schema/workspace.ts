import { index, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { project } from "./project";
import { hardware } from ".";

// Upon creating a Flojoy Cloud account, the user will be prompted to
// create a workspace. (This can be a part of the singup wizard like mentioned
// in the comment above).
export const planTypeEnum = pgEnum("plan_type", ["hobby", "pro", "enterprise"]);

export const workspace = pgTable(
  "workspace",
  {
    ...baseModal("workspace"),
    name: text("name").notNull(),
    namespace: text("namespace").notNull().unique(),
    planType: planTypeEnum("plan_type").notNull(),
    totalSeats: integer("total_seats").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (workspace) => ({
    workspaceNamespaceIndex: index().on(workspace.namespace),
  }),
);

export const workspaceRelation = relations(workspace, ({ many }) => ({
  projects: many(project),
  hardwares: many(hardware),
}));
