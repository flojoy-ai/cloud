import { primaryKey, text } from "drizzle-orm/pg-core";
import { project } from "./project";
import { pgTable } from "./table";
import { hardware } from "./hardware";

export const project_hardware = pgTable(
  "project_hardware",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    hardwareId: text("hardware_id")
      .notNull()
      .references(() => hardware.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.hardwareId] }),
  }),
);
