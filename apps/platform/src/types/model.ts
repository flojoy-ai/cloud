import { z } from "zod";
import { Model, model } from "~/schemas/public/Model";

export const modelComponentSchema = z.object({
  modelId: z.string(),
  name: z.string(),
  count: z.number().min(1),
});

export const insertModelSchema = model
  .pick({ name: true, workspaceId: true })
  .extend({
    name: z.string().min(1),
    components: z.array(modelComponentSchema.omit({ name: true })).default([]),
  });

export type InsertModel = z.infer<typeof insertModelSchema>;

export type ModelTree = Pick<Model, "name" | "id"> & {
  components: { count: number; model: ModelTree }[];
};

export const modelTreeSchema: z.ZodType<ModelTree> = z.object({
  id: z.string(),
  name: z.string().min(1),
  components: z.lazy(() =>
    z.object({ count: z.number(), model: modelTreeSchema }).array(),
  ),
});
