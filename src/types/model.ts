import { z } from "zod";
import { model } from "~/schemas/public/Model";

export const systemModelPartSchema = z.object({
  modelId: z.string(),
  name: z.string(),
  count: z.number().min(1),
});

export const insertModelSchema = model.extend({
  name: z.string().min(1),
  components: z.array(systemModelPartSchema.omit({ name: true })),
});

type ModelTree = z.infer<typeof model> & {
  components: { count: number; model: ModelTree }[];
};

export const selectModelTreeSchema: z.ZodType<ModelTree> = model.extend({
  name: z.string().min(1),
  components: z.lazy(() =>
    z.object({ count: z.number(), model: selectModelTreeSchema }).array(),
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
