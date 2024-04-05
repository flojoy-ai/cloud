import { Unit } from "../schemas/public/Unit";
import { Static, t } from "elysia";
import { PartVariation } from "./part-variation";

export type { Unit };

export type UnitWithPartVariation = Unit & {
  partVariation: PartVariation;
};

export type UnitWithParent = Unit & {
  parent: UnitWithPartVariation | null;
};

export const insertUnit = t.Object({
  projectId: t.Optional(t.String()),
  partVariationId: t.String(),
  serialNumber: t.String({ minLength: 1 }),
  components: t.Array(t.String(), { default: [] }),
});

export type InsertUnit = Static<typeof insertUnit>;

export type UnitTreeRoot = UnitWithPartVariation &
  UnitWithParent & {
    components: UnitTreeNode[];
  };

export type UnitTreeNode = Pick<
  Unit,
  "serialNumber" | "id" | "partVariationId"
> & {
  partNumber: string;
  components: UnitTreeNode[];
};

export const swapUnitComponent = t.Object({
  unitId: t.String(),
  oldUnitComponentId: t.String(),
  newUnitComponentId: t.String(),
  reason: t.Optional(t.String()),
});

export type SwapUnitComponent = Static<typeof swapUnitComponent>;

export const unitRevisionType = t.Union([
  t.Literal("init"),
  t.Literal("remove"),
  t.Literal("add"),
]);

export const unitRevision = t.Object({
  unitId: t.String(),
  revisionType: unitRevisionType,
  createdAt: t.Date(),
  componentId: t.String(),
  componentSerialNumber: t.String(),
  reason: t.Nullable(t.String()),
  userId: t.String(),
  userEmail: t.String(),
});

export type UnitRevision = Static<typeof unitRevision>;
export type RevisionType = Static<typeof unitRevisionType>;
