import { workspaceUserTable } from "~/server/db/schema";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectWorkspaceUser = typeof workspaceUserTable.$inferSelect;
export type InsertWorkspaceUser = typeof workspaceUserTable.$inferInsert;

export const selectWorkspaceUserSchema = createSelectSchema(workspaceUserTable);
export const insertWorkspaceUserSchema = createInsertSchema(workspaceUserTable);
