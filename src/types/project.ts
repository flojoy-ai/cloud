import { type project } from "~/server/db/schema";

export type SelectProject = typeof project.$inferSelect;
