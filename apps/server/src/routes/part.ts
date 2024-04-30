import { db } from "../db/kysely";
import Elysia, { error, t } from "elysia";
import { createPart } from "../db/part";
import { insertPart } from "@cloud/shared";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkPartPerm } from "../lib/perm/part";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import {
  withPartVariationMarket,
  withPartVariationType,
} from "../db/part-variation";

export const PartRoute = new Elysia({ prefix: "/part", name: "PartRoute" })
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspaceUser }) => {
    const parts = await db
      .selectFrom("part")
      .selectAll("part")
      .where("part.workspaceId", "=", workspaceUser.workspaceId)
      .leftJoin("part_variation", "part_variation.partId", "part.id")
      .leftJoin("unit", "part_variation.id", "unit.partVariationId")
      .select(({ fn }) =>
        fn.count<number>("part_variation.id").as("partVariationCount"),
      )
      .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
      .groupBy("part.id")
      .execute();
    return parts;
  })
  .post(
    "/",
    async ({ body, error, workspace, authMethod }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      const res = await createPart(db, { ...body, workspaceId: workspace.id });
      if (res.isErr()) {
        return error(500, res.error);
      }
      return res.value;
    },
    {
      body: t.Omit(insertPart, ["workspaceId"]),
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({ workspaceUser });

        return perm.match(
          (perm) => (perm.canWrite() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
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
            .leftJoin("part_variation", "part_variation.partId", "part.id")
            .leftJoin("unit", "part_variation.id", "unit.partVariationId")
            .select(({ fn }) =>
              fn.count<number>("part_variation.id").as("partVariationCount"),
            )
            .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
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
        "/partVariation",
        async ({ workspace, params: { partId } }) => {
          const partVariations = await db
            .selectFrom("part_variation")
            .selectAll("part_variation")
            .where("part_variation.workspaceId", "=", workspace.id)
            .where("part_variation.partId", "=", partId)
            .select((eb) => [withPartVariationType(eb)])
            .select((eb) => [withPartVariationMarket(eb)])
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
  );
