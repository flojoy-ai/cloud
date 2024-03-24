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
        .selectAll()
        .where("workspaceId", "=", workspaceId)
        .execute();
      console.log(families);
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
