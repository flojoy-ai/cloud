import {
  PartVariation,
  insertUnit,
  queryBool,
  swapUnitComponent,
} from "@cloud/shared";
import { Elysia, error, t } from "elysia";
import { db } from "../db/kysely";
import {
  createUnit,
  doUnitComponentSwap,
  getUnit,
  getUnitRevisions,
  getUnitTree,
  notInUse,
  withUnitParent,
  withUnitPartVariation,
} from "../db/unit";
import { checkUnitPerm } from "../lib/perm/unit";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { WorkspaceMiddleware } from "../middlewares/workspace";

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
        .orderBy("unit.serialNumber", "asc");

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
        const perm = await checkWorkspacePerm({ workspaceUser });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .post(
    "/",
    async ({ body, error, workspace, user }) => {
      const res = await createUnit(db, workspace.id, user, body);
      if (res.isErr()) {
        return error(res.error.code, res.error.message);
      }
      return res.value;
    },
    {
      body: insertUnit,
      async beforeHandle({ workspaceUser, error }) {
        const perm = await checkWorkspacePerm({ workspaceUser });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
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
            .select((eb) => [withUnitPartVariation(eb), withUnitParent(eb)])
            .$narrowType<{ partVariation: PartVariation }>()
            .executeTakeFirst();
          if (unit === undefined) {
            return error(404, "Unit not found");
          }

          return await getUnitTree(unit);
        },
        {
          async beforeHandle({ workspaceUser, error, params: { unitId } }) {
            const perm = await checkUnitPerm({ unitId, workspaceUser });

            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
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
            const perm = await checkUnitPerm({ unitId, workspaceUser });

            return perm.match(
              (perm) => (perm.canWrite() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
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
            const perm = await checkUnitPerm({ unitId, workspaceUser });

            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      ),
  );
