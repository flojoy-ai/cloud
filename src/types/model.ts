import { model } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectModel = typeof model.$inferSelect;

export const insertModelSchema = createInsertSchema(model);

export const publicInsertDeviceModelSchema = insertModelSchema.pick({
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

export const selectDeviceModelSchema = selectModelSchema.extend({
  type: z.literal("device").default("device"),
});

export const selectSystemModelSchema = selectModelSchema.extend({
  type: z.literal("system").default("system"),
  parts: systemPartsSchema,
});

export type SelectSystemModel = z.infer<typeof selectSystemModelSchema>;
export type SelectDeviceModel = z.infer<typeof selectDeviceModelSchema>;
