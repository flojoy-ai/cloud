import { z } from "zod";
import { workspaceAccessMiddleware } from "./workspace";

import _ from "lodash";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { populateExample } from "~/server/services/example";

export const exampleRouter = createTRPCRouter({
  populateExample: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        await populateExample(tx, input.workspaceId);
      });
    }),
});
