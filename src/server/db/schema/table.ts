import { pgTableCreator, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const pgTable = pgTableCreator((name) => `cloud_${name}`);

export const baseModal = (prefix: string) => ({
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => prefix + "_" + createId()),
});
