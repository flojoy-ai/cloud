import { primaryKey, text } from "drizzle-orm/pg-core";
import { projectTable } from "./project";
import { pgTable } from "./table";
import { hardwareTable } from "./hardware";

export const projectHardwareTable = pgTable(
  "project_hardware",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, { onDelete: "cascade" }),
    hardwareId: text("hardware_id")
      .notNull()
      .references(() => hardwareTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.hardwareId] }),
  }),
);
