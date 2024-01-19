import { text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "./table";
import { user } from ".";

// Each project can have a bunch of hardware devices registered to it.
export const email_verification = pgTable("email_verification", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, {
      onDelete: "cascade",
    })
    .notNull(),
  expires: timestamp("expires").notNull(),
});
