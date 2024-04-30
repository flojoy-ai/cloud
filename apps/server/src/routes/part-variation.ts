import { insertPartVariation } from "@cloud/shared";
import Elysia, { t } from "elysia";
import { db } from "../db/kysely";
import {
  createPartVariation,
  getPartVariationTree,
  withPartVariationMarket,
  withPartVariationType,
} from "../db/part-variation";
import { withUnitParent } from "../db/unit";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { fromTransaction } from "../lib/db-utils";

export const PartVariationRoute = new Elysia({
  prefix: "/partVariation",
  name: "PartVariationRoute",
})
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspace }) => {
    const partVariations = await db
      .selectFrom("part_variation")
      .selectAll("part_variation")
      .where("part_variation.workspaceId", "=", workspace.id)
      .leftJoin("unit", "part_variation.id", "unit.partVariationId")
      .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
      .select((eb) => [withPartVariationType(eb)])
      .select((eb) => [withPartVariationMarket(eb)])
      .groupBy("part_variation.id")
      .orderBy("part_variation.partNumber", "asc")
      .execute();

    return partVariations;
  })
  .get("/type", async ({ workspace }) => {
    return await db
      .selectFrom("part_variation_type as pvt")
      .selectAll("pvt")
      .where("pvt.workspaceId", "=", workspace.id)
      .execute();
  })
  .get("/market", async ({ workspace }) => {
    return await db
      .selectFrom("part_variation_market as pvm")
      .selectAll("pvm")
      .where("pvm.workspaceId", "=", workspace.id)
      .execute();
  })
  .post(
    "/",
    async ({ body, error, workspace, authMethod }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      const res = await fromTransaction(async (tx) => {
        return await createPartVariation(tx, {
          ...body,
          workspaceId: workspace.id,
        });
      });
      if (res.isErr()) return error(res.error.code, res.error);

      return res.value;
    },
    {
      body: t.Omit(insertPartVariation, ["workspaceId"]),
      async beforeHandle({ workspaceUser, error }) {
        const perm = await checkWorkspacePerm({ workspaceUser });

        return perm.match(
          (perm) => (perm.canWrite() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .group("/:partVariationId", (app) =>
    app
      .get(
        "/",
        async ({ workspace, params: { partVariationId }, error }) => {
          const partVariation = await db
            .selectFrom("part_variation")
            .selectAll("part_variation")
            .where("part_variation.id", "=", partVariationId)
            .where("part_variation.workspaceId", "=", workspace.id)
            .select((eb) => [withPartVariationType(eb)])
            .select((eb) => [withPartVariationMarket(eb)])
            .leftJoin("unit", "part_variation.id", "unit.partVariationId")
            .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
            .executeTakeFirst();

          if (partVariation === undefined) {
            return error(404, "PartVariation not found");
          }

          return await getPartVariationTree(partVariation);
        },
        {
          params: t.Object({ partVariationId: t.String() }),

          async beforeHandle({ workspaceUser, error }) {
            const perm = await checkWorkspacePerm({ workspaceUser });
            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      )
      .get(
        "/unit",
        async ({ workspace, params: { partVariationId } }) => {
          const partVariations = await db
            .selectFrom("unit")
            .selectAll("unit")
            .where("unit.workspaceId", "=", workspace.id)
            .where("unit.partVariationId", "=", partVariationId)
            .select((eb) => withUnitParent(eb))
            .execute();

          return partVariations;
        },
        {
          params: t.Object({ partVariationId: t.String() }),

          async beforeHandle({ workspaceUser, error }) {
            const perm = await checkWorkspacePerm({ workspaceUser });

            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      ),
  );
