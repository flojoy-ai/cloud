import { baseModal, pgTable } from ".";
import { text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./user";
import { workspace } from "./workspace";

export const secret = pgTable(
  "secret",
  {
    ...baseModal("secret"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (secret) => ({
    unq: unique().on(secret.userId, secret.workspaceId),
  }),
);
