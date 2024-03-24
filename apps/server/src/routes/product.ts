import { db } from "@/db/kysely";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import Elysia from "elysia";

export const ProductRoute = new Elysia({ prefix: "/product" })
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspace }) => {
    const products = await db
      .selectFrom("product")
      .selectAll()
      .where("workspaceId", "=", workspace.id)
      .execute();
    return products;
  });
