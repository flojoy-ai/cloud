import { workspace } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectWorkspace = typeof workspace.$inferSelect;

export const insertWorkspaceSchema = createInsertSchema(workspace);
export const publicInsertWorkspaceSchema = insertWorkspaceSchema.pick({
  name: true,
});
export const selectWorkspaceSchema = createSelectSchema(workspace);
