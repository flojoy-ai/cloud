import { db } from "@/db/kysely";
import Elysia, { t } from "elysia";
import { createModel, getModelTree } from "@/db/model";
import { Model, insertModel } from "@/types/model";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import { jsonObjectFrom } from "kysely/helpers/postgres";

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
  .group("/:modelId", (app) =>
    app
      .get(
        "/",
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
          params: t.Object({ modelId: t.String() }),
        },
      )
      .get(
        "/hardware",
        async ({ workspace, params: { modelId } }) => {
          const models = await db
            .selectFrom("hardware")
            .selectAll("hardware")
            .where("hardware.workspaceId", "=", workspace.id)
            .where("hardware.modelId", "=", modelId)
            .leftJoin(
              "hardware_relation",
              "hardware.id",
              "hardware_relation.childHardwareId",
            )
            .select((eb) =>
              jsonObjectFrom(
                eb
                  .selectFrom("hardware as h")
                  .selectAll("h")
                  .select((eb) =>
                    jsonObjectFrom(
                      eb
                        .selectFrom("model")
                        .selectAll("model")
                        .whereRef("model.id", "=", "h.modelId"),
                    ).as("model"),
                  )
                  .$narrowType<{ model: Model }>()
                  .whereRef("h.id", "=", "hardware_relation.parentHardwareId"),
              ).as("parent"),
            )
            .execute();

          return models;
        },
        { params: t.Object({ modelId: t.String() }) },
      ),
  );
