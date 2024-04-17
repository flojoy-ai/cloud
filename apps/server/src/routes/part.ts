import { db } from "../db/kysely";
import Elysia, { error, t } from "elysia";
import { createPart } from "../db/part";
import { insertPart } from "@cloud/shared";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkPartPerm } from "../lib/perm/part";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { PartVariationType } from "@cloud/shared/src/schemas/public/PartVariationType";
import { PartVariationMarket } from "@cloud/shared/src/schemas/public/PartVariationMarket";

export const PartRoute = new Elysia({ prefix: "/part", name: "PartRoute" })
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspaceUser }) => {
    const families = await db
      .selectFrom("part")
      .selectAll("part")
      .where("part.workspaceId", "=", workspaceUser.workspaceId)
      .leftJoin("part_variation", "part_variation.partId", "part.id")
      .leftJoin("unit", "part_variation.id", "unit.partVariationId")
      .select(({ fn }) =>
        fn
          .count<number>("part_variation.id")
          .distinct()
          .as("partVariationCount"),
      )
      .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
      .groupBy("part.id")
      .execute();
    return families;
  })
  .group("/:partId", (app) =>
    app
      .get(
        "/",
        async ({ workspace, params: { partId }, error }) => {
          const part = await db
            .selectFrom("part")
            .selectAll("part")
            .where("part.workspaceId", "=", workspace.id)
            .where("part.id", "=", partId)
            .innerJoin("product", "product.id", "part.productId")
            .select("product.name as productName")

            .executeTakeFirst();
          if (part === undefined) return error(404, "Part not found");
          return part;
        },
        {
          params: t.Object({ partId: t.String() }),
          async beforeHandle({ params, workspaceUser }) {
            const perm = await checkPartPerm({
              partId: params.partId,
              workspaceUser,
            });

            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      )
      .get(
        "/partVariations",
        async ({ workspace, params: { partId } }) => {
          const partVariations = await db
            .selectFrom("part_variation")
            .selectAll("part_variation")
            .where("part_variation.workspaceId", "=", workspace.id)
            .where("part_variation.partId", "=", partId)
            .select((eb) => [
              jsonObjectFrom(
                eb
                  .selectFrom("part_variation_type as pvt")
                  .selectAll("pvt")
                  .whereRef("pvt.id", "=", "part_variation.typeId"),
              ).as("type"),
            ])
            .$narrowType<{ type: PartVariationType }>()
            .select((eb) => [
              jsonObjectFrom(
                eb
                  .selectFrom("part_variation_market as pvm")
                  .selectAll("pvm")
                  .whereRef("pvm.id", "=", "part_variation.marketId"),
              ).as("market"),
            ])
            .$narrowType<{ market: PartVariationMarket }>()
            .leftJoin("unit", "part_variation.id", "unit.partVariationId")
            .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
            .groupBy("part_variation.id")
            .execute();

          return partVariations;
        },
        {
          params: t.Object({ partId: t.String() }),
          async beforeHandle({ params, workspaceUser }) {
            const perm = await checkPartPerm({
              partId: params.partId,
              workspaceUser,
            });
            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      ),
  )
  .post(
    "/",
    async ({ body, error }) => {
      const res = await createPart(db, body);
      if (res.isErr()) {
        return error(500, res.error);
      }
      return res.value;
    },
    {
      body: insertPart,
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({ workspaceUser });

        return perm.match(
          (perm) => (perm.canWrite() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  );
