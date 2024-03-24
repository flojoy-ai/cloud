import { db } from "@/db/kysely";
import { AuthMiddleware } from "@/middlewares/auth";
import Elysia, { t } from "elysia";
import { createModel, getModelTree } from "@/db/model";
import { insertModel } from "@/types/model";

export const ModelRoute = new Elysia({ prefix: "/model" })
  .use(AuthMiddleware)
  .get(
    "/",
    async ({ query: { workspaceId } }) => {
      const models = await db
        .selectFrom("model")
        .selectAll("model")
        .where("model.workspaceId", "=", workspaceId)
        .execute();

      return models;
    },
    { query: t.Object({ workspaceId: t.String() }) },
  )
  .post(
    "/",
    async ({ body, error }) => {
      const res = await createModel(db, body);
      if (res.isErr()) {
        return error(500, res.error);
      }
      return res.value;
    },
    { body: insertModel },
  )
  .get(
    "/:modelId",
    async ({ params: { modelId }, query: { workspaceId }, error }) => {
      const model = await db
        .selectFrom("model")
        .selectAll()
        .where("id", "=", modelId)
        .where("workspaceId", "=", workspaceId)
        .executeTakeFirst();
      if (model === undefined) {
        return error(404, "Model not found");
      }

      return await getModelTree(model);
    },
    {
      query: t.Object({ workspaceId: t.String() }),
      params: t.Object({ modelId: t.String() }),
    },
  );
