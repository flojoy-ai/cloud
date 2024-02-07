import { z } from "zod";
import {
  hardware,
  hardwareInitializer,
  hardwareMutator,
} from "~/schemas/public/Hardware";
import { model } from "~/schemas/public/Model";

export const selectHardwareSchema = hardware.extend({ model: model });
export type SelectHardware = z.infer<typeof selectHardwareSchema>;

export const insertHardwareSchema = hardwareInitializer
  .pick({
    name: true,
    modelId: true,
    workspaceId: true,
  })
  .extend({
    name: z.string().min(1),
    parts: z.string().array(),
  });

export const updateHardwareSchema = insertHardwareSchema
  .pick({
    name: true,
    workspaceId: true,
  })
  .extend({
    hardwareId: z.string(),
  });
