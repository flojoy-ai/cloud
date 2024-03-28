import { Model } from "../schemas/public/Model";
import { t, Static } from "elysia";

export type { Model };

export const modelComponent = t.Object({
  modelId: t.String(),
  name: t.String(),
  count: t.Number({ min: 1 }),
});

export const insertModel = t.Object({
  workspaceId: t.String(),
  familyId: t.String(),
  name: t.String({ minLength: 1 }),
  description: t.Nullable(t.String()),
  components: t.Array(t.Omit(modelComponent, ["name"]), { default: [] }),
});

export type InsertModel = Static<typeof insertModel>;

export type ModelTreeRoot = Model & {
  components: { count: number; model: ModelTreeNode }[];
};

export type ModelTreeNode = Pick<Model, "name" | "id"> & {
  components: { count: number; model: ModelTreeNode }[];
};
