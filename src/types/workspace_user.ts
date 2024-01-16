import { workspace_user } from "~/server/db/schema";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectWorkspaceUser = typeof workspace_user.$inferSelect;
export type InsertWorkspaceUser = typeof workspace_user.$inferInsert;

export const selectWorkspaceUserSchema = createSelectSchema(workspace_user);
export const insertWorkspaceUserSchema = createInsertSchema(workspace_user);
