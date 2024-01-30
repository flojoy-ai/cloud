import { workspaceTable } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectWorkspace = typeof workspaceTable.$inferSelect;

export const insertWorkspaceSchema = createInsertSchema(workspaceTable, {
  name: z.string().min(1),
});
export const publicInsertWorkspaceSchema = insertWorkspaceSchema
  .pick({
    name: true,
    namespace: true,
  })
  .extend({
    populateData: z.boolean().optional(),
  });

export const publicUpdateWorkspaceSchema = insertWorkspaceSchema
  .pick({
    name: true,
    namespace: true,
  })
  .extend({
    workspaceId: z.string(),
  });

export const selectWorkspaceSchema = createSelectSchema(workspaceTable);
