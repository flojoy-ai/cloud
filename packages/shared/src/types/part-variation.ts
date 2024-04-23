import { t, Static } from "elysia";

import { PartVariation } from "../schemas/public/PartVariation";
export type { PartVariation };

export const partVariationComponent = t.Object({
  partVariationId: t.String(),
  partNumber: t.String(),
  count: t.Number({ min: 1 }),
});

export const insertPartVariation = t.Object({
  workspaceId: t.String(),
  partId: t.String(),
  type: t.Optional(t.String()),
  market: t.Optional(t.String()),
  partNumber: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  components: t.Array(t.Omit(partVariationComponent, ["partNumber"]), {
    default: [],
  }),
});

export type InsertPartVariation = Static<typeof insertPartVariation>;

export const updatePartVariation = t.Object({
  type: t.Optional(t.String()),
  market: t.Optional(t.String()),
  partNumber: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  components: t.Array(t.Omit(partVariationComponent, ["partNumber"]), {
    default: [],
  }),
});

export type UpdatePartVariation = Static<typeof updatePartVariation>;

export type PartVariationTreeRoot = PartVariation & {
  components: { count: number; partVariation: PartVariationTreeNode }[];
};

export type PartVariationTreeNode = Pick<
  PartVariation,
  "partNumber" | "id" | "description"
> & {
  components: { count: number; partVariation: PartVariationTreeNode }[];
};
