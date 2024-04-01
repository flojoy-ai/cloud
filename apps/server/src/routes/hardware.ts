import {
  createHardware,
  doHardwareComponentSwap,
  getHardwareRevisions,
  getHardwareTree,
  notInUse,
  withHardwarePartVariation,
} from "../db/hardware";
import { db } from "../db/kysely";
import { HardwareMiddleware } from "../middlewares/hardware";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { insertHardware, swapHardwareComponent } from "@cloud/shared";
import { PartVariation } from "@cloud/shared";
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
        .select((eb) => withHardwarePartVariation(eb))
        .$narrowType<{ partVariation: PartVariation }>()
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
            .select((eb) => withHardwarePartVariation(eb))
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
                        .selectFrom("part_variation")
                        .selectAll("part_variation")
                        .whereRef(
                          "part_variation.id",
                          "=",
                          "h.partVariationId",
                        ),
                    ).as("partVariation"),
                  )
                  .$narrowType<{ partVariation: PartVariation }>()
                  .whereRef("h.id", "=", "hardware_relation.parentHardwareId"),
              ).as("parent"),
            )
            .$narrowType<{ partVariation: PartVariation }>()
            .executeTakeFirst();
          if (hardware === undefined) {
            return error(404, "PartVariation not found");
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
