import { db } from "@/db/kysely";
import { AuthMiddleware } from "@/middlewares/auth";
import Elysia, { t } from "elysia";
import { createFamily } from "@/db/family";
import { insertFamily } from "@/types/family";

export const FamilyRoute = new Elysia({ prefix: "/family" })
  .use(AuthMiddleware)
  .get(
    "/",
    async ({ query: { workspaceId } }) => {
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
    },
    { query: t.Object({ workspaceId: t.String() }) },
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
