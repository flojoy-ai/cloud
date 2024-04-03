import { AuthMiddleware } from "../middlewares/auth";
import { Elysia } from "elysia";
import { DatabaseError } from "pg";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { generateWorkpspacePersonalAccessToken } from "../lib/secret";
import { db } from "../db/kysely";

export const SecretRoute = new Elysia({ prefix: "/secret" })
  .use(AuthMiddleware)
  .use(WorkspaceMiddleware)
  .error({
    DatabaseError,
  })
  .onError(({ code, error, set }) => {
    // TODO: handle this better
    switch (code) {
      case "DatabaseError":
        set.status = 409;
        return error;
      default:
        return error;
    }
  })
  .get("/", async ({ workspaceUser }) => {
    const secret = await db
      .selectFrom("secret as s")
      .selectAll()
      .where("s.userId", "=", workspaceUser.userId)
      .where("s.workspaceId", "=", workspaceUser.workspaceId)
      .executeTakeFirst();

    return secret;
  })
  .post("/", async ({ workspaceUser }) => {
    const value = await generateWorkpspacePersonalAccessToken(workspaceUser);

    await db
      .deleteFrom("secret as s")
      .where("s.workspaceId", "=", workspaceUser.workspaceId)
      .where("s.userId", "=", workspaceUser.userId)
      .execute();

    const secret = await db
      .insertInto("secret")
      .values({
        userId: workspaceUser.userId,
        workspaceId: workspaceUser.workspaceId,
        value,
      })
      .execute();

    return secret;
  });
