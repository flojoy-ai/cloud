import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { AuthContext } from "@/context/auth";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContext;
}>()({
  component: () => (
    <div className={""}>
      <Outlet />

      {!import.meta.env.PROD && (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools />
        </>
      )}
    </div>
  ),
  // leaving this here because i'm annoyed at the suspense errors
  pendingComponent: CenterLoadingSpinner,
});
