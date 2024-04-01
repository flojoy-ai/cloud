import { db } from "../db/kysely";
import Elysia, { t } from "elysia";
import { createPart } from "../db/part";
import { insertPart } from "@cloud/shared";
import { WorkspaceMiddleware } from "../middlewares/workspace";

export const PartRoute = new Elysia({ prefix: "/part" })
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspace }) => {
    const families = await db
      .selectFrom("part")
      .selectAll("part")
      .where("part.workspaceId", "=", workspace.id)
      .leftJoin("part_variation", "part_variation.partId", "part.id")
      .leftJoin("hardware", "part_variation.id", "hardware.partVariationId")
      .select(({ fn }) =>
        fn
          .count<number>("part_variation.id")
          .distinct()
          .as("partVariationCount"),
      )
      .select(({ fn }) => fn.count<number>("hardware.id").as("hardwareCount"))
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
            .leftJoin(
              "hardware",
              "part_variation.id",
              "hardware.partVariationId",
            )
            .select(({ fn }) =>
              fn.count<number>("hardware.id").as("hardwareCount"),
            )
            .groupBy("part_variation.id")
            .execute();

          return partVariations;
        },
        { params: t.Object({ partId: t.String() }) },
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
    { body: insertPart },
  );
