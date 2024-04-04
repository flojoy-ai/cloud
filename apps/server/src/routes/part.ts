import { db } from "../db/kysely";
import Elysia, { error, t } from "elysia";
import { createPart } from "../db/part";
import { insertPart } from "@cloud/shared";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkPartPerm } from "../lib/perm/part";
import { checkWorkspacePerm } from "../lib/perm/workspace";

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
            const result = await checkPartPerm(
              {
                partId: params.partId,
                workspaceUser,
              },
              "read",
            );

            if (result.isErr()) {
              return error(403, result.error);
            }

            if (!result.value) {
              return error(403, "You do not have permission to read this part");
            }
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
            .leftJoin("unit", "part_variation.id", "unit.partVariationId")
            .select(({ fn }) => fn.count<number>("unit.id").as("unitCount"))
            .groupBy("part_variation.id")
            .execute();

          return partVariations;
        },
        {
          params: t.Object({ partId: t.String() }),
          async beforeHandle({ params, workspaceUser }) {
            const result = await checkPartPerm(
              {
                partId: params.partId,
                workspaceUser,
              },
              "read",
            );

            if (result.isErr()) {
              return error(403, result.error);
            }

            if (!result.value) {
              return error(403, "You do not have permission to read this part");
            }
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
        const result = await checkWorkspacePerm({ workspaceUser }, "write");

        if (result.isErr()) {
          return error(403, result.error);
        }
        if (!result.value) {
          return error(403, "You do not have permission to create a part");
        }
      },
    },
  );
