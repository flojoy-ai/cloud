import { db } from "@/db/kysely";
import Elysia, { t } from "elysia";
import { createModel, getModelTree } from "@/db/model";
import { insertModel } from "@/types/model";
import { WorkspaceMiddleware } from "@/middlewares/workspace";

export const ModelRoute = new Elysia({ prefix: "/model" })
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspace }) => {
    const models = await db
      .selectFrom("model")
      .selectAll("model")
      .where("model.workspaceId", "=", workspace.id)
      .execute();

    return models;
  })
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
    async ({ workspace, params: { modelId }, error }) => {
      const model = await db
        .selectFrom("model")
        .selectAll()
        .where("id", "=", modelId)
        .where("workspaceId", "=", workspace.id)
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
