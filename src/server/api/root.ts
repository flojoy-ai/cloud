import { createTRPCRouter } from "~/server/api/trpc";
import { workspaceRouter } from "./routers/workspace";
import { projectRouter } from "./routers/project";
import { testRouter } from "./routers/test";
import { deviceRouter } from "./routers/devices";
import { measurementRouter } from "./routers/measurement";
import { secretRouter } from "./routers/secret";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  project: projectRouter,
  test: testRouter,
  device: deviceRouter,
  measurement: measurementRouter,
  secret: secretRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
