import { db } from "@/db/kysely";
import Elysia, { t } from "elysia";
import { createFamily } from "@/db/family";
import { insertFamily } from "@/types/family";
import { WorkspaceMiddleware } from "@/middlewares/workspace";

export const FamilyRoute = new Elysia({ prefix: "/family" })
  .use(WorkspaceMiddleware)
  .get("/", async ({ headers: { "flojoy-workspace-id": workspaceId } }) => {
    const families = await db
      .selectFrom("family")
      .selectAll("family")
      .where("family.workspaceId", "=", workspaceId)
      .leftJoin("model", "model.familyId", "family.id")
      .leftJoin("hardware", "model.id", "hardware.modelId")
      .select(({ fn }) =>
        fn.count<number>("model.id").distinct().as("modelCount"),
      )
      .select(({ fn }) => fn.count<number>("hardware.id").as("hardwareCount"))
      .groupBy("family.id")
      .execute();
    return families;
  })
  .get(
    "/:familyId",
    async ({
      headers: { "flojoy-workspace-id": workspaceId },
      params: { familyId },
      error,
    }) => {
      const family = await db
        .selectFrom("family")
        .selectAll("family")
        .where("family.workspaceId", "=", workspaceId)
        .where("family.id", "=", familyId)
        .innerJoin("product", "product.id", "family.productId")
        .select("product.name as productName")
        .executeTakeFirst();
      if (family === undefined) return error(404, "Family not found");
      return family;
    },
    {
      params: t.Object({ familyId: t.String() }),
    },
  )
  .post(
    "/",
    async ({ body, error }) => {
      const res = await createFamily(db, body);
      if (res.isErr()) {
        return error(500, res.error);
      }
      return res.value;
    },
    { body: insertFamily },
  );
