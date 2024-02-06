import { z } from "zod";
import { hardware } from "~/schemas/public/Hardware";
import { model } from "~/schemas/public/Model";

export const selectHardware = hardware.extend({ model: model });
export type SelectHardware = z.infer<typeof selectHardware>;
