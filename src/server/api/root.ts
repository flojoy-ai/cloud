import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "./routers/example";
import { hardwareRouter } from "./routers/hardware";
import { measurementRouter } from "./routers/measurement";
import { modelRouter } from "./routers/model";
import { projectRouter } from "./routers/project";
import { secretRouter } from "./routers/secret";
import { testRouter } from "./routers/test";
import { workspaceRouter } from "./routers/workspace";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  project: projectRouter,
  test: testRouter,
  hardware: hardwareRouter,
  measurement: measurementRouter,
  secret: secretRouter,
  model: modelRouter,
  example: exampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
