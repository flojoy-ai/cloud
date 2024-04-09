import CenterLoadingSpinner from "@/components/center-loading-spinner";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/auth";
import { handleError } from "@/lib/utils";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
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

  errorComponent: ({ error, reset }) => {
    return (
      <PageHeader>
        <PageHeaderHeading>Oops!</PageHeaderHeading>
        <PageHeaderDescription>An error occured :(</PageHeaderDescription>
        <div className="py-2"></div>
        <div className="text-red-500">{handleError(error)}</div>
        <div className="py-2"></div>
        <Button asChild onClick={reset}>
          <Link to="/">Home</Link>
        </Button>
      </PageHeader>
    );
  },
  // leaving this here because i'm annoyed at the suspense errors
  pendingComponent: CenterLoadingSpinner,
});
