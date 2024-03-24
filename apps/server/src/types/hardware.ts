import { Hardware } from "@/schemas/public/Hardware";

export type HardwareTree = Pick<Hardware, "name" | "id" | "modelId"> & {
  modelName: string;
  components: HardwareTree[];
};
