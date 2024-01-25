import { project } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectProject = typeof project.$inferSelect;

export const insertProjectSchema = createInsertSchema(project);

export const publicInsertProjectSchema = insertProjectSchema.pick({
  name: true,
  modelId: true,
  workspaceId: true,
});

export const publicUpdateProjectSchema = insertProjectSchema
  .pick({
    name: true,
  })
  .extend({
    projectId: z.string(),
  });

export const selectProjectSchema = createSelectSchema(project);

export const projectConstraintSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("system"),
    // need to make sure the key of this map is a device not a system
    build: z.map(z.string().startsWith("model_"), z.number().nonnegative()),
  }),
  z.object({
    type: z.literal("device"),
    modelId: z.string().startsWith("model_"),
  }),
]);

export type ProjectConstraint = z.infer<typeof projectConstraintSchema>;
