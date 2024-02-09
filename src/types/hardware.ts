import { z } from "zod";
import { Hardware, hardware, hardwareMutator } from "~/schemas/public/Hardware";
import { Model } from "~/schemas/public/Model";

export type SelectHardware = Hardware & { model: Model };

export const hardwareComponentSchema = z.object({
  hardwareId: z.string(),
  name: z.string(),
});

export const insertHardwareSchema = hardware
  .pick({ name: true, workspaceId: true, modelId: true })
  .extend({
    name: z.string().min(1),
    components: z.array(hardwareComponentSchema.omit({ name: true })),
    projectId: z.string().optional(),
  });

export type HardwareTree = Pick<Hardware, "name" | "id" | "modelId"> & {
  components: { hardware: HardwareTree }[];
};

export const hardwareTreeSchema: z.ZodType<HardwareTree> = z.object({
  id: z.string(),
  name: z.string().min(1),
  modelId: z.string().min(1),
  components: z.lazy(() => z.object({ hardware: hardwareTreeSchema }).array()),
});
