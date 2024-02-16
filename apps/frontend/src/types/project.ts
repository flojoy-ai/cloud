import { z } from "zod";
import { model } from "~/schemas/public/Model";
import { project, projectInitializer } from "~/schemas/public/Project";

export const insertProjectSchema = projectInitializer
  .pick({
    name: true,
    modelId: true,
    workspaceId: true,
  })
  .extend({
    name: z.string().min(1),
  });

export const selectProjectSchema = project.extend({ model: model });

export const publicUpdateProjectSchema = insertProjectSchema
  .pick({
    name: true,
  })
  .extend({
    projectId: z.string(),
  });
