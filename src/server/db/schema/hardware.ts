import { text } from "drizzle-orm/pg-core";
import { baseModal, pgTable } from "./table";
import { workspace } from "./workspace";

export const hardware = pgTable(
  "hardware",
  {
    ...baseModal("hardware"),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
  },
  (table) => ({}),
);
