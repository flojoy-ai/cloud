import { hardware } from "~/server/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export type SelectHardware = typeof hardware.$inferSelect;

export const insertHardwareSchema = createInsertSchema(hardware);

export const publicInsertDeviceSchema = insertHardwareSchema.pick({
  name: true,
  workspaceId: true,
  modelId: true,
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

export const selectHardwareSchema = createSelectSchema(hardware);
