import { text, timestamp, boolean, bigint } from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";

// After a user signs up with the auth provider, we will create a user
// object in our database as well. This user object will also record the
// unique ID from the auth provider such that we can easily look up user
// information from the auth provider.
// When the 'signupCompleted' field is false, we will redirect the user
// to a signup wizard (which we can use to collect more info)
// to complete the signup process.
export const user = pgTable("user", {
  ...baseModal("user"),
  signupCompleted: boolean("signup_completed").default(false),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// The user_session and user_key tables are internal to Lucia
// Therefore, they do not have the baseModal fields (ID prefix).

export const user_session = pgTable("user_session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  authProvider: text("auth_provider", { enum: ["google"] }).notNull(),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

export const user_key = pgTable("user_key", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  hashedPassword: text("hashed_password"),
});
