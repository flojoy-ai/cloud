import { hardware } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { selectModelBaseSchema } from "./model";

export const insertHardwareSchema = createInsertSchema(hardware, {
  name: z.string().min(1),
});

export const publicInsertDeviceSchema = insertHardwareSchema
  .pick({
    name: true,
    workspaceId: true,
    modelId: true,
  })
  .extend({
    projectId: z.string().optional(),
  });

export const publicUpdateHardwareSchema = insertHardwareSchema
  .pick({
    name: true,
  })
  .extend({
    hardwareId: z.string(),
  });

export const publicInsertSystemSchema = publicInsertDeviceSchema.extend({
  deviceIds: z
    .string()
    .array()
    .min(1)
    .superRefine((val, ctx) => {
      if (val.length !== new Set(val).size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Device IDs cannot have duplicates.`,
        });
      }
    }),
});

export const systemPartSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: selectModelBaseSchema,
});

export const selectHardwareBaseSchema = createSelectSchema(hardware).extend({
  model: selectModelBaseSchema,
});

export const selectDeviceSchema = selectHardwareBaseSchema.extend({
  type: z.literal("device").default("device"),
});

export const selectSystemSchema = selectHardwareBaseSchema.extend({
  type: z.literal("system").default("system"),
  parts: z.array(systemPartSchema),
});

export const selectHardwareSchema = z.union([
  selectDeviceSchema,
  selectSystemSchema,
]);

export type SelectSystem = z.infer<typeof selectSystemSchema>;
export type SelectDevice = z.infer<typeof selectDeviceSchema>;
export type SelectHardware = z.infer<typeof selectHardwareSchema>;
export type SelectHardwareBase = z.infer<typeof selectHardwareBaseSchema>;
export type SystemPart = z.infer<typeof systemPartSchema>;
