import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useAuth } from "./hooks/use-auth";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./lib/client";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  // defaultPreloadStaleTime: 0,
  // FIXME: Joey: comment this out for now, since this is a router bug
  // https://github.com/TanStack/router/issues/1201
  // https://github.com/TanStack/router/issues/1162
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}
