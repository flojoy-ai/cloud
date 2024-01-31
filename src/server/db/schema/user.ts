import {
  serial,
  text,
  timestamp,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspaceTable } from "./workspace";
import { workspaceRoles } from "~/config/workspace_user";
import { relations } from "drizzle-orm";

// After a user signs up with the auth provider, we will create a user
// object in our database as well. This user object will also record the
// unique ID from the auth provider such that we can easily look up user
// information from the auth provider.
// When the 'signupCompleted' field is false, we will redirect the user
// to a signup wizard (which we can use to collect more info)
// to complete the signup process.
export const userTable = pgTable("user", {
  ...baseModal("user"),
  emailVerified: boolean("email_verified").default(false),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// The user_session and user_key tables are internal to Lucia
// Therefore, they do not have the baseModal fields (ID prefix).

export const sessionTable = pgTable("user_session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const oauthAccountTable = pgTable(
  "oauth_account",
  {
    providerId: text("provider_id").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.providerId, table.providerUserId] }),
  }),
);

export const passwordResetTokenTable = pgTable("password_reset_token", {
  id: serial("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const emailVerificationTable = pgTable("email_verification", {
  id: serial("id").notNull().primaryKey(),
  code: text("code").notNull(),
  userId: text("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  email: text("email").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export const userInviteTable = pgTable("user_invite", {
  id: serial("id").notNull().primaryKey(),
  email: text("email").notNull(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaceTable.id, { onDelete: "cascade" }),
  role: text("role", { enum: workspaceRoles }).notNull(),
});

export const userInviteRelation = relations(userInviteTable, ({ one }) => ({
  test: one(workspaceTable, {
    fields: [userInviteTable.workspaceId],
    references: [workspaceTable.id],
  }),
}));
