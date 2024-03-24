import { db } from "@/db/kysely";
import { AuthMiddleware } from "@/middlewares/auth";
import Elysia, { t } from "elysia";

export const ProductRoute = new Elysia({ prefix: "/product" })
  .use(AuthMiddleware)
  .get(
    "/",
    async ({ query: { workspaceId } }) => {
      const products = await db
        .selectFrom("product")
        .selectAll()
        .where("workspaceId", "=", workspaceId)
        .execute();
      return products;
    },
    {
      query: t.Object({ workspaceId: t.String() }),
    },
  );
