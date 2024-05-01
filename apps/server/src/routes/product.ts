import { db } from "../db/kysely";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import Elysia from "elysia";

export const ProductRoute = new Elysia({
  prefix: "/product",
  name: "ProductRoute",
})
  .use(WorkspaceMiddleware)
  .get("/", async ({ workspaceUser, log }) => {
    const products = await db
      .selectFrom("product")
      .selectAll()
      .where("workspaceId", "=", workspaceUser.workspaceId)
      .execute();
    log.info(products);
    return products;
  });
