import { createNextRoute } from "@ts-rest/next";
import { secretContract } from "~/contract/routers/secret";

import * as jose from "jose";
import { env } from "~/env";
import { generateDatabaseId } from "~/lib/id";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export const secretRouter = createNextRoute(secretContract, {
  createSecret: async (args) => {
    // const date = new Date();
    //
    // const jwtValue = await new jose.SignJWT({
    //   userId: ctx.user.id,
    //   workspaceId: input.workspaceId,
    // })
    //   .setProtectedHeader({ alg: "HS256" })
    //   .setIssuedAt(date)
    //   .sign(jwtSecret);
    //
    // await ctx.db
    //   .deleteFrom("secret as s")
    //   .where("s.workspaceId", "=", input.workspaceId)
    //   .where("s.userId", "=", ctx.user.id)
    //   .execute();
    //
    // const secretCreateResult = await ctx.db
    //   .insertInto("secret")
    //   .values({
    //     id: generateDatabaseId("secret"),
    //     userId: ctx.user.id,
    //     workspaceId: input.workspaceId,
    //     value: jwtValue,
    //   })
    //   .returningAll()
    //   .executeTakeFirst();
    //
    // if (!secretCreateResult) {
    //   return {
    //     message: "Failed to create secret",
    //   };
    // }
    //
    // return secretCreateResult;
  },
  getSecret: async (args) => {},
});

// import { z } from "zod";
//
// import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
//
// import { env } from "~/env";
// import { workspaceAccessMiddleware } from "./workspace";
// import { TRPCError } from "@trpc/server";
// import { secret } from "~/schemas/public/Secret";
// import { generateDatabaseId } from "~/lib/id";
//
//
// export const secretRouter = createTRPCRouter({
//   _createSecret: workspaceProcedure
//     .input(z.object({ workspaceId: z.string() }))
//     .use(workspaceAccessMiddleware)
//     .output(secret)
//     .mutation(async ({ ctx, input }) => {
//       const date = new Date();
//
//       const jwtValue = await new jose.SignJWT({
//         userId: ctx.user.id,
//         workspaceId: input.workspaceId,
//       })
//         .setProtectedHeader({ alg: "HS256" })
//         .setIssuedAt(date)
//         .sign(jwtSecret);
//
//       await ctx.db
//         .deleteFrom("secret as s")
//         .where("s.workspaceId", "=", input.workspaceId)
//         .where("s.userId", "=", ctx.user.id)
//         .execute();
//
//       const secretCreateResult = await ctx.db
//         .insertInto("secret")
//         .values({
//           id: generateDatabaseId("secret"),
//           userId: ctx.user.id,
//           workspaceId: input.workspaceId,
//           value: jwtValue,
//         })
//         .returningAll()
//         .executeTakeFirst();
//
//       if (!secretCreateResult) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to create secret",
//         });
//       }
//
//       return secretCreateResult;
//     }),
//
//   _getSecret: workspaceProcedure
//     .input(z.object({ workspaceId: z.string() }))
//     .use(workspaceAccessMiddleware)
//     .output(z.optional(secret))
//     .query(async ({ ctx }) => {
//       return await ctx.db
//         .selectFrom("secret as s")
//         .where("s.userId", "=", ctx.user.id)
//         .where("s.workspaceId", "=", ctx.workspaceId)
//         .selectAll()
//         .executeTakeFirst();
//     }),
// });
