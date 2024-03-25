import { Hardware } from "@/schemas/public/Hardware";
import { Static, t } from "elysia";

export type { Hardware };

export const insertHardware = t.Object({
  projectId: t.Optional(t.String()),
  modelId: t.String(),
  name: t.String({ minLength: 1 }),
  components: t.Array(t.String(), { default: [] }),
});
export type InsertHardware = Static<typeof insertHardware>;

export type HardwareTree = Pick<Hardware, "name" | "id" | "modelId"> & {
  modelName: string;
  components: HardwareTree[];
};
