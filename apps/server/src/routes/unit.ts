import {
  createUnit,
  doUnitComponentSwap,
  getUnit,
  getUnitRevisions,
  getUnitTree,
  notInUse,
  withUnitPartVariation,
} from "../db/unit";
import { db } from "../db/kysely";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { insertUnit, swapUnitComponent } from "@cloud/shared";
import { PartVariation } from "@cloud/shared";
import { queryBool } from "@cloud/shared";
import { Elysia, error, t } from "elysia";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { checkUnitPerm } from "../lib/perm/unit";

export const UnitRoute = new Elysia({ prefix: "/unit", name: "UnitRoute" })
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
      async beforeHandle({ workspaceUser, error }) {
        const result = await checkWorkspacePerm({ workspaceUser }, "read");

        if (result.isErr()) {
          return error(403, result.error);
        }
        if (!result.value) {
          return error(
            403,
            "You do not have permission to read units in this workspace",
          );
        }
      },
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
    {
      body: insertUnit,
      async beforeHandle({ workspaceUser, error }) {
        const result = await checkWorkspacePerm({ workspaceUser }, "write");

        if (result.isErr()) {
          return error(403, result.error);
        }
        if (!result.value) {
          return error(403, "You do not have permission to create a unit");
        }
      },
    },
  )
  .group("/:unitId", { params: t.Object({ unitId: t.String() }) }, (app) =>
    app
      .get(
        "/",
        async ({ workspace, params: { unitId }, error }) => {
          const unit = await db
            .selectFrom("unit")
            .selectAll("unit")
            .where("id", "=", unitId)
            .where("workspaceId", "=", workspace.id)
            .select((eb) => withUnitPartVariation(eb))
            .leftJoin("unit_relation", "unit.id", "unit_relation.childUnitId")
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
        },
        {
          async beforeHandle({ workspaceUser, error, params: { unitId } }) {
            const result = await checkUnitPerm(
              { unitId, workspaceUser },
              "read",
            );

            if (result.isErr()) {
              return error(403, result.error);
            }
            if (!result.value) {
              return error(403, "You do not have permission to read this unit");
            }
          },
        },
      )
      .patch(
        "/",
        async ({ workspaceUser, body, error, params: { unitId } }) => {
          const unit = await getUnit(unitId);
          if (!unit) return error("Not Found");

          const res = await doUnitComponentSwap(unit, workspaceUser, body);
          if (res.isErr()) {
            return error(res.error.code, res.error.message);
          }

          return {
            success: true,
          };
        },
        {
          body: swapUnitComponent,
          async beforeHandle({ workspaceUser, error, params: { unitId } }) {
            const result = await checkUnitPerm(
              { unitId, workspaceUser },
              "write",
            );

            if (result.isErr()) {
              return error(403, result.error);
            }
            if (!result.value) {
              return error(
                403,
                "You do not have permission to update this unit",
              );
            }
          },
        },
      )
      .get(
        "/revisions",
        async ({ params: { unitId } }) => {
          const unit = await getUnit(unitId);
          if (!unit) return error("Not Found");
          return await getUnitRevisions(unit.id);
        },
        {
          async beforeHandle({ workspaceUser, error, params: { unitId } }) {
            const result = await checkUnitPerm(
              { unitId, workspaceUser },
              "read",
            );

            if (result.isErr()) {
              return error(403, result.error);
            }
            if (!result.value) {
              return error(403, "You do not have permission to read this unit");
            }
          },
        },
      ),
  );
