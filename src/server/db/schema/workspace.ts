import {
  index,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { projectTable } from "./project";
import { hardwareTable, userTable } from ".";
import { workspaceRoles } from "~/config/workspace_user";

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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (workspace) => ({
    workspaceNamespaceIndex: index().on(workspace.namespace),
  }),
);

export const workspaceUserTable = pgTable(
  "workspace_user",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    role: text("role", { enum: workspaceRoles }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
    };
  },
);

export const workspaceRelation = relations(workspaceTable, ({ many }) => ({
  projects: many(projectTable),
  hardwares: many(hardwareTable),
}));
