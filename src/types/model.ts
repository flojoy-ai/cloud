import { model } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const insertModelSchema = createInsertSchema(model);

export const publicInsertDeviceModelSchema = insertModelSchema.pick({
  name: true,
  workspaceId: true,
});

export const systemPartSchema = z.object({
  modelId: z.string().min(1),
  name: z.string(),
  count: z.number().min(1),
});

export const publicInsertSystemModelSchema =
  publicInsertDeviceModelSchema.extend({
    parts: z.array(systemPartSchema.omit({ name: true })),
  });

export const selectModelBaseSchema = createSelectSchema(model);

export const selectDeviceModelSchema = selectModelBaseSchema.extend({
  type: z.literal("device").default("device"),
});

export const selectSystemModelSchema = selectModelBaseSchema.extend({
  type: z.literal("system").default("system"),
  parts: z.array(systemPartSchema),
});

export const selectModelSchema = z.union([
  selectDeviceModelSchema,
  selectSystemModelSchema,
]);

export type SelectSystemModel = z.infer<typeof selectSystemModelSchema>;
export type SelectDeviceModel = z.infer<typeof selectDeviceModelSchema>;
export type SelectModel = z.infer<typeof selectModelSchema>;
export type SystemPart = z.infer<typeof systemPartSchema>;
