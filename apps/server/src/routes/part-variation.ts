import { insertPartVariation } from "@cloud/shared";
import Elysia, { t } from "elysia";
import { db } from "../db/kysely";
import {
  createPartVariation,
  getPartVariationTree,
} from "../db/part-variation";
import { withUnitParent } from "../db/unit";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { fromTransaction } from "../lib/db-utils";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { PartVariationType } from "@cloud/shared/src/schemas/public/PartVariationType";
import { PartVariationMarket } from "@cloud/shared/src/schemas/public/PartVariationMarket";

export const PartVariationRoute = new Elysia({
  prefix: "/partVariation",
  name: "PartVariationRoute",
})
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspace }) => {
    const partVariations = await db
      .selectFrom("part_variation as pv")
      .selectAll("pv")
      .where("pv.workspaceId", "=", workspace.id)
      .leftJoin("unit", "pv.id", "unit.partVariationId")
      .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("part_variation_type as pvt")
            .selectAll("pvt")
            .whereRef("pvt.id", "=", "pv.typeId"),
        ).as("type"),
      ])
      .$narrowType<{ type: PartVariationType }>()
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("part_variation_market as pvm")
            .selectAll("pvm")
            .whereRef("pvm.id", "=", "pv.marketId"),
        ).as("market"),
      ])
      .$narrowType<{ market: PartVariationMarket }>()
      .groupBy("pv.id")
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
    async ({ body, error }) => {
      const res = await fromTransaction(async (tx) => {
        return await createPartVariation(tx, body);
      });
      if (res.isErr()) return error(res.error.code, res.error);

      return res.value;
    },
    {
      body: insertPartVariation,
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
            .selectFrom("part_variation as pv")
            .selectAll("pv")
            .where("pv.id", "=", partVariationId)
            .where("pv.workspaceId", "=", workspace.id)
            .select((eb) => [
              jsonObjectFrom(
                eb
                  .selectFrom("part_variation_type as pvt")
                  .selectAll("pvt")
                  .whereRef("pvt.id", "=", "pv.typeId"),
              ).as("type"),
            ])
            .$narrowType<{ type: PartVariationType }>()
            .select((eb) => [
              jsonObjectFrom(
                eb
                  .selectFrom("part_variation_market as pvm")
                  .selectAll("pvm")
                  .whereRef("pvm.id", "=", "pv.marketId"),
              ).as("market"),
            ])
            .$narrowType<{ market: PartVariationMarket }>()
            .executeTakeFirst();
          console.log(partVariation);

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
