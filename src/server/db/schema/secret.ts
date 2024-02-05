import { baseModal, pgTable } from "./table";
import { text, timestamp, unique } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { workspaceTable } from "./workspace";

export const secretTable = pgTable(
  "secret",
  {
    ...baseModal("secret"),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (secret) => ({
    unq: unique().on(secret.userId, secret.workspaceId),
  }),
);
