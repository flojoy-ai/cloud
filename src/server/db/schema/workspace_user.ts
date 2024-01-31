import { text, timestamp, primaryKey, boolean } from "drizzle-orm/pg-core";
import { pgTable } from "./table";
import { userTable } from "./user";
import { workspaceTable } from "./workspace";
import { workspaceRoles } from "~/config/workspace_user";

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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
    };
  },
);
