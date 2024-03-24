import { AuthMiddleware } from "@/middlewares/auth";
import { ProjectMiddleware } from "@/middlewares/project";
// import { createWorkspace } from "@/types/workspace";
import { Elysia } from "elysia";
// import { db } from "@/db/kysely";
import { DatabaseError } from "pg";
// import { generateDatabaseId } from "@/lib/db-utils";
// import { populateExample } from "@/db/example";

export const ProjectRoute = new Elysia({ prefix: "/project" })
  .use(AuthMiddleware)
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
  // .get(
  //   "/",
  //   async ({ user }) => {
  //     return await db
  //       .selectFrom("workspace_user as wu")
  //       .innerJoin("workspace as w", "w.id", "wu.workspaceId")
  //       .innerJoin("user as u", "u.id", "wu.userId")
  //       .where("wu.userId", "=", user.id)
  //       .selectAll("w")
  //       .execute();
  //   },
  //   {},
  // )
  // .post(
  //   "/",
  //   async ({ body, user, error, cookie: { scope } }) => {
  //     const { populateData, ...data } = body;
  //
  //     const newWorkspace = await db.transaction().execute(async (tx) => {
  //       const newWorkspace = await tx
  //         .insertInto("workspace")
  //         .values({
  //           id: generateDatabaseId("workspace"),
  //           ...data,
  //           planType: "enterprise",
  //         })
  //         .returningAll()
  //         .executeTakeFirst();
  //
  //       if (!newWorkspace) {
  //         return error(500, "Failed to create workspace");
  //       }
  //
  //       await tx
  //         .insertInto("workspace_user")
  //         .values({
  //           workspaceId: newWorkspace.id,
  //           userId: user.id,
  //           role: "owner" as const,
  //         })
  //         .execute();
  //
  //       scope.value = newWorkspace.namespace;
  //
  //       return newWorkspace;
  //     });
  //
  //     if ("_type" in newWorkspace) {
  //       return newWorkspace;
  //     }
  //
  //     if (!populateData) {
  //       return newWorkspace;
  //     }
  //
  //     await populateExample(db, newWorkspace.id);
  //
  //     return newWorkspace;
  //   },
  //   {
  //     body: createWorkspace,
  //     cookie: t.Cookie({
  //       scope: t.String(),
  //     }),
  //   },
  // )
  .group("/:projectId", (project) =>
    project.use(ProjectMiddleware).get("/", async ({ params, project }) => {
      console.log(params.projectId);
      console.log(project);
    }),
  );
// .get(
//   "/id/:namespace",
//   async ({ params }) => {
//     const res = await db
//       .selectFrom("workspace")
//       .select("id")
//       .where("workspace.namespace", "=", params.namespace)
//       .executeTakeFirstOrThrow(
//         () =>
//           new NotFoundError(
//             `Workspace with namespace '${params.namespace}' not found`,
//           ),
//       );
//
//     return res.id;
//   },
//   {
//     params: t.Object({ namespace: t.String() }),
//   },
// );
