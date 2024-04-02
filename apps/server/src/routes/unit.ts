import {
  createUnit,
  doUnitComponentSwap,
  getUnitRevisions,
  getUnitTree,
  notInUse,
  withUnitPartVariation,
} from "../db/unit";
import { db } from "../db/kysely";
import { UnitMiddleware } from "../middlewares/unit";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { insertUnit, swapUnitComponent } from "@cloud/shared";
import { PartVariation } from "@cloud/shared";
import { queryBool } from "@cloud/shared";
import Elysia, { t } from "elysia";
import { jsonObjectFrom } from "kysely/helpers/postgres";

export const UnitRoute = new Elysia({ prefix: "/unit" })
  .use(WorkspaceMiddleware)
  .get(
    "/",
    async ({ workspace, query: { onlyAvailable } }) => {
      let query = db
        .selectFrom("unit")
        .selectAll("unit")
        .where("unit.workspaceId", "=", workspace.id)
        .select((eb) => withUnitPartVariation(eb))
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
      const res = await createUnit(db, workspace.id, user, body);
      if (res.isErr()) {
        return error(500, res.error.message);
      }
      return res.value;
    },
    { body: insertUnit },
  )
  .group(
    "/:unitId",
    { params: t.Object({ unitId: t.String() }) },
    (app) =>
      app
        .use(UnitMiddleware)
        .get("/", async ({ workspace, params: { unitId }, error }) => {
          const unit = await db
            .selectFrom("unit")
            .selectAll("unit")
            .where("id", "=", unitId)
            .where("workspaceId", "=", workspace.id)
            .select((eb) => withUnitPartVariation(eb))
            .leftJoin(
              "unit_relation",
              "unit.id",
              "unit_relation.childUnitId",
            )
            .select((eb) =>
              jsonObjectFrom(
                eb
                  .selectFrom("unit as h")
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
                  .whereRef("h.id", "=", "unit_relation.parentUnitId"),
              ).as("parent"),
            )
            .$narrowType<{ partVariation: PartVariation }>()
            .executeTakeFirst();
          if (unit === undefined) {
            return error(404, "PartVariation not found");
          }

          return await getUnitTree(unit);
        })
        .patch(
          "/",
          async ({ unit, workspaceUser, body, error }) => {
            if (workspaceUser.role === "member") {
              return error("Forbidden");
            }
            const res = await doUnitComponentSwap(
              unit,
              workspaceUser,
              body,
            );
            if (res.isErr()) {
              return error(res.error.code, res.error.message);
            }

            return {};
          },
          { body: swapUnitComponent },
        )
        .get("/revisions", async ({ unit }) => {
          return await getUnitRevisions(unit.id);
        }),
  );
