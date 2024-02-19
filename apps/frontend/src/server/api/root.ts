import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "./routers/example";
import { hardwareRouter } from "./routers/hardware";
import { measurementRouter } from "./routers/measurement";
import { modelRouter } from "./routers/model";
import { projectRouter } from "./routers/project";
import { secretRouter } from "./routers/secret";
import { testRouter } from "./routers/test";
import { workspaceRouter } from "./routers/workspace";
import { userRouter } from "./routers/user";
import { emailRouter } from "./routers/email";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  email: emailRouter,
  hardware: hardwareRouter,
  measurement: measurementRouter,
  model: modelRouter,
  project: projectRouter,
  secret: secretRouter,
  test: testRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
