import { workspace } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectWorkspace = typeof workspace.$inferSelect;

export const insertWorkspaceSchema = createInsertSchema(workspace);
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

export const selectWorkspaceSchema = createSelectSchema(workspace);
