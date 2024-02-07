import { z } from "zod";
import { Hardware, hardware } from "~/schemas/public/Hardware";

export const hardwareComponentSchema = z.object({
  hardwareId: z.string(),
  name: z.string(),
});

export const insertHardwareSchema = hardware
  .pick({ name: true, workspaceId: true, modelId: true })
  .extend({
    name: z.string().min(1),
    components: z.array(hardwareComponentSchema.omit({ name: true })),
  });

export type HardwareTree = Pick<Hardware, "name" | "id"> & {
  components: { hardware: HardwareTree }[];
};

export const hardwareTreeSchema: z.ZodType<HardwareTree> = z.object({
  id: z.string(),
  name: z.string().min(1),
  modelId: z.string().min(1),
  components: z.lazy(() => z.object({ hardware: hardwareTreeSchema }).array()),
});
