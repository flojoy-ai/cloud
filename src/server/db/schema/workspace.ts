import {
  index,
  text,
  timestamp,
  pgEnum,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseModal, pgTable } from "./table";
import { project } from "./project";
import { device } from "./device";
import { user } from "./user";

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
  devices: many(device),
}));

// The workspaces_users table is a join table between the workspaces and users
// It is used to keep track of which user belongs to which workspace.
export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "member",
  "pending", // An invite has sent but the user has not accepted it yet
]);

export const workspace_user = pgTable(
  "workspace_user",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    workspaceRole: workspaceRoleEnum("workspace_role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
    };
  },
);
