import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import {
  createPartVariation,
  getPartVariationTree,
} from "../db/part-variation";
import { PartVariation, insertPartVariation } from "@cloud/shared";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { checkWorkspacePerm } from "../lib/perm/workspace";

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
      .groupBy("part_variation.id")
      .execute();

    return partVariations;
  })
  .post(
    "/",
    async ({ body, error }) => {
      const res = await createPartVariation(db, body);
      if (res.isErr()) {
        return error(500, res.error);
      }
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
            .selectFrom("part_variation")
            .selectAll()
            .where("id", "=", partVariationId)
            .where("workspaceId", "=", workspace.id)
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
