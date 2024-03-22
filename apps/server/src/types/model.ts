import { Model } from "@/schemas/public/Model";
import { t, Static } from "elysia";

export const modelComponent = t.Object({
  modelId: t.String(),
  name: t.String(),
  count: t.Number({ min: 1 }),
});

export const insertModel = t.Object({
  workspaceId: t.String(),
  familyId: t.String(),
  name: t.String({ minLength: 1 }),
  components: t.Array(t.Omit(modelComponent, ["name"]), { default: [] }),
});

export type InsertModel = Static<typeof insertModel>;

export type ModelTree = Pick<Model, "name" | "id"> & {
  components: { count: number; model: ModelTree }[];
};
