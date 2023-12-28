import { type workspace } from "~/server/db/schema";

export type SelectWorkspace = typeof workspace.$inferSelect;
