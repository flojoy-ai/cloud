import { text, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { pgTable } from "./table";
import { userTable } from "./user";
import { workspaceTable } from "./workspace";

// The workspaces_users table is a join table between the workspaces and users
// It is used to keep track of which user belongs to which workspace.
export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "member",
  "pending", // An invite has sent but the user has not accepted it yet
]);

export const workspaceUserTable = pgTable(
  "workspace_user",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    workspaceRole: workspaceRoleEnum("workspace_role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
    };
  },
);
