import { baseModal, pgTable } from "./table";
import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { measurementTable } from "./measurement";

export const tagTable = pgTable(
  "tag",
  {
    ...baseModal("tag"),
    name: text("name").notNull(),
    measurementId: text("measurement_id")
      .notNull()
      .references(() => measurementTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (tags) => ({
    tagNameMeasurementIdIndex: index().on(tags.name, tags.measurementId),
    unq: unique().on(tags.measurementId, tags.name),
  }),
);
