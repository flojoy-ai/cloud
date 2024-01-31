import { userTable } from "~/server/db/schema";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export const selectUserSchema = createSelectSchema(userTable);
export const insertUserSchema = createInsertSchema(userTable);
