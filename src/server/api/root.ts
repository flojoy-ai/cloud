import { helloRouter } from "~/server/api/routers/hello";
import { createTRPCRouter } from "~/server/api/trpc";
import { workspaceRouter } from "./routers/workspace";
import { projectRouter } from "./routers/project";
import { testRouter } from "./routers/test";
import { deviceRouter } from "./routers/devices";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  hello: helloRouter,
  workspace: workspaceRouter,
  project: projectRouter,
  test: testRouter,
  device: deviceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
