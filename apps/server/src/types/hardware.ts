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

export const swapHardwareComponent = t.Object({
  hardwareId: t.String(),
  oldHardwareComponentId: t.String(),
  newHardwareComponentId: t.String(),
  reason: t.Optional(t.String()),
});

export type SwapHardwareComponent = Static<typeof swapHardwareComponent>;

export const hardwareRevisionType = t.Union([
  t.Literal("init"),
  t.Literal("remove"),
  t.Literal("add"),
]);

export const hardwareRevision = t.Object({
  hardwareId: t.String(),
  revisionType: hardwareRevisionType,
  createdAt: t.Date(),
  componentId: t.String(),
  componentName: t.String(),
  reason: t.Nullable(t.String()),
  userId: t.String(),
  userEmail: t.String(),
});

export type HardwareRevision = Static<typeof hardwareRevision>;
