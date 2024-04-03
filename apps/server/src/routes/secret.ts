import { AuthMiddleware } from "../middlewares/auth";
import { Elysia, error } from "elysia";
import { DatabaseError } from "pg";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { db } from "../db/kysely";
import { lucia } from "../auth/lucia";

export const SecretRoute = new Elysia({ prefix: "/secret" })
  .use(AuthMiddleware)
  .use(WorkspaceMiddleware)
  .error({
    DatabaseError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "DatabaseError":
        set.status = 500;
        return error;
      default:
        return error;
    }
  })
  .get("/", async ({ workspaceUser, authMethod }) => {
    if (authMethod === "secret") {
      return error("I'm a teapot");
    }

    const session = await db
      .selectFrom("user_session as us")
      .selectAll()
      .where("us.userId", "=", workspaceUser.userId)
      .where("us.workspaceId", "=", workspaceUser.workspaceId)
      .executeTakeFirst();

    return session;
  })
  .post("/", async ({ workspaceUser, authMethod }) => {
    if (authMethod === "secret") {
      return error("I'm a teapot");
    }

    await db
      .deleteFrom("user_session as us")
      .where("us.userId", "=", workspaceUser.userId)
      .where("us.workspaceId", "=", workspaceUser.workspaceId)
      .execute();

    const session = await lucia.createSession(workspaceUser.userId, {
      workspace_id: workspaceUser.workspaceId,
    });

    return session;
  });
