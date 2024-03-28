import {
  createHardware,
  doHardwareComponentSwap,
  getHardwareRevisions,
  getHardwareTree,
  notInUse,
  withHardwareModel,
} from "../db/hardware";
import { db } from "../db/kysely";
import { HardwareMiddleware } from "../middlewares/hardware";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { insertHardware, swapHardwareComponent } from "@cloud/shared";
import { Model } from "@cloud/shared";
import { queryBool } from "@cloud/shared";
import Elysia, { t } from "elysia";
import { jsonObjectFrom } from "kysely/helpers/postgres";

export const HardwareRoute = new Elysia({ prefix: "/hardware" })
  .use(WorkspaceMiddleware)
  .get(
    "/",
    async ({ workspace, query: { onlyAvailable } }) => {
      let query = db
        .selectFrom("hardware")
        .selectAll("hardware")
        .where("hardware.workspaceId", "=", workspace.id)
        .select((eb) => withHardwareModel(eb))
        .$narrowType<{ model: Model }>()
        .orderBy("createdAt");

      if (onlyAvailable) {
        query = query.where(notInUse);
      }

      const data = await query.execute();
      return data;
    },
    {
      query: t.Object({
        onlyAvailable: queryBool,
      }),
    },
  )
  .post(
    "/",
    async ({ body, error, workspace, user }) => {
      const res = await createHardware(db, workspace.id, user, body);
      if (res.isErr()) {
        return error(500, res.error.message);
      }
      return res.value;
    },
    { body: insertHardware },
  )
  .group(
    "/:hardwareId",
    { params: t.Object({ hardwareId: t.String() }) },
    (app) =>
      app
        .use(HardwareMiddleware)
        .get("/", async ({ workspace, params: { hardwareId }, error }) => {
          const hardware = await db
            .selectFrom("hardware")
            .selectAll("hardware")
            .where("id", "=", hardwareId)
            .where("workspaceId", "=", workspace.id)
            .select((eb) => withHardwareModel(eb))
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
            .$narrowType<{ model: Model }>()
            .executeTakeFirst();
          if (hardware === undefined) {
            return error(404, "Model not found");
          }

          return await getHardwareTree(hardware);
        })
        .patch(
          "/",
          async ({ hardware, workspaceUser, body, error }) => {
            if (workspaceUser.role === "member") {
              return error("Forbidden");
            }
            const res = await doHardwareComponentSwap(
              hardware,
              workspaceUser,
              body,
            );
            if (res.isErr()) {
              return error(res.error.code, res.error.message);
            }

            return {};
          },
          { body: swapHardwareComponent },
        )
        .get("/revisions", async ({ hardware }) => {
          return await getHardwareRevisions(hardware.id);
        }),
  );
