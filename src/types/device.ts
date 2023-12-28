import { type device } from "~/server/db/schema";

export type SelectDevice = typeof device.$inferSelect;
