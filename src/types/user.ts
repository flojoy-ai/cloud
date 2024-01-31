import { userTable, userInviteTable } from "~/server/db/schema";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export const selectUserSchema = createSelectSchema(userTable);
export const insertUserSchema = createInsertSchema(userTable);

export type SelectUserInvite = typeof userInviteTable.$inferSelect;
export type InsertUserInvite = typeof userInviteTable.$inferInsert;

export const selectUserInviteSchema = createSelectSchema(userInviteTable);
export const insertUserInviteSchema = createInsertSchema(userInviteTable);
