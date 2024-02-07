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
    components: z.array(modelComponentSchema.omit({ name: true })),
  });

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

// import { modelTable } from "~/server/db/schema";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import { z } from "zod";
//
// export const insertModelSchema = createInsertSchema(modelTable, {
//   name: z.string().min(1),
// });
//
// export const publicInsertDeviceModelSchema = insertModelSchema.pick({
//   name: true,
//   workspaceId: true,
// });
//
// export const systemModelPartSchema = z.object({
//   modelId: z.string(),
//   name: z.string(),
//   count: z.number().min(1),
// });
//
// export const publicInsertSystemModelSchema =
//   publicInsertDeviceModelSchema.extend({
//     parts: z.array(systemModelPartSchema.omit({ name: true })),
//   });
//
// export const selectModelBaseSchema = createSelectSchema(modelTable);
//
// export const selectDeviceModelSchema = selectModelBaseSchema.extend({
//   type: z.literal("device").default("device"),
// });
//
// export const selectSystemModelSchema = selectModelBaseSchema.extend({
//   type: z.literal("system").default("system"),
//   parts: z.array(systemModelPartSchema),
// });
//
// export const selectModelSchema = z.union([
//   selectDeviceModelSchema,
//   selectSystemModelSchema,
// ]);
//
// export type SelectSystemModel = z.infer<typeof selectSystemModelSchema>;
// export type SelectDeviceModel = z.infer<typeof selectDeviceModelSchema>;
// export type SelectModel = z.infer<typeof selectModelSchema>;
// export type SystemModelPart = z.infer<typeof systemModelPartSchema>;
