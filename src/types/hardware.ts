import { z } from "zod";
import { Hardware, hardware } from "~/schemas/public/Hardware";
import { hardwareRevision } from "~/schemas/public/HardwareRevision";
import { Model } from "~/schemas/public/Model";

export type SelectHardware = Hardware & { model: Model };

export const hardwareComponentSchema = z.object({
  hardwareId: z.string(),
  name: z.string().min(1),
});

export const insertHardwareSchema = hardware
  .pick({ name: true, workspaceId: true, modelId: true })
  .extend({
    name: z.string().min(1),
    components: z.array(hardwareComponentSchema.omit({ name: true })),
    projectId: z.string().optional(),
  });

export const swapHardwareComponentSchema = z.object({
  hardwareId: z.string(),
  oldHardwareComponentId: z.string(),
  newHardwareComponentId: z.string(),
  reason: z.string().optional(),
});

export const selectHardwareRevision = hardwareRevision.extend({
  componentName: z.string(),
  userEmail: z.string(),
});

export type SelectHardwareRevision = z.infer<typeof selectHardwareRevision>;

export type HardwareTree = Pick<Hardware, "name" | "id" | "modelId"> & {
  modelName: string;
  components: HardwareTree[];
};

export const hardwareTreeSchema: z.ZodType<HardwareTree> = z.object({
  id: z.string(),
  name: z.string().min(1),
  modelId: z.string().min(1),
  modelName: z.string().min(1),
  components: z.lazy(() => hardwareTreeSchema.array()),
});
