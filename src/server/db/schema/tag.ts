import { baseModal, pgTable } from "./table";
import { index, text, timestamp, unique } from "drizzle-orm/pg-core";
import { measurement } from "./measurement";

export const tag = pgTable(
  "tag",
  {
    ...baseModal("tag"),
    name: text("name").notNull(),
    measurementId: text("measurement_id")
      .notNull()
      .references(() => measurement.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (tags) => ({
    tagNameMeasurementIdIndex: index().on(tags.name, tags.measurementId),
    unq: unique().on(tags.measurementId, tags.name),
  }),
);
