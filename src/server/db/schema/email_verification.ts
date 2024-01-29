import { text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "./table";
import { userTable } from ".";

// Each project can have a bunch of hardware devices registered to it.
export const emailVerificationTable = pgTable("email_verification", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  expires: timestamp("expires").notNull(),
});
