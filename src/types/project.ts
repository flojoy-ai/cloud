import { project } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type SelectProject = typeof project.$inferSelect;

export const insertProjectSchema = createInsertSchema(project);
export const publicInsertProjectSchema = insertProjectSchema.pick({
  name: true,
  workspaceId: true,
});

export const selectProjectSchema = createSelectSchema(project);
