import { model } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectModel = typeof model.$inferSelect;

export const insertDeviceModelSchema = createInsertSchema(model);

export const publicInsertDeviceModelSchema = insertDeviceModelSchema.pick({
  name: true,
  workspaceId: true,
});

export const systemPartsSchema = z.array(
  z.object({ modelId: z.string().min(1), count: z.number().min(1) }),
);

export const publicInsertSystemModelSchema =
  publicInsertDeviceModelSchema.extend({
    parts: systemPartsSchema,
  });

export const selectModelSchema = createSelectSchema(model);

export const selectDeviceModelSchema = selectModelSchema;

export const selectSystemModelSchema = selectModelSchema.extend({
  parts: systemPartsSchema,
});
