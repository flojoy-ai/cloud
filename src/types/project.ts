import { z } from "zod";
import { projectInitializer } from "~/schemas/public/Project";

export const insertProjectSchema = projectInitializer
  .pick({
    name: true,
    modelId: true,
    workspaceId: true,
  })
  .extend({
    name: z.string().min(1),
  });

export const publicUpdateProjectSchema = insertProjectSchema
  .pick({
    name: true,
  })
  .extend({
    projectId: z.string(),
  });
