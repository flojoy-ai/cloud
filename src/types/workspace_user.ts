import { type workspace_user } from "~/server/db/schema";

export type SelectWorkspaceUser = typeof workspace_user.$inferSelect;
