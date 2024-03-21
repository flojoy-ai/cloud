import { SiteHeader } from "@/components/site-header";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <div className={""}>
      <SiteHeader />
      {/* <div className="p-2 flex gap-2"> */}
      {/*   <Link to="/" className=""> */}
      {/*     Home */}
      {/*   </Link>{" "} */}
      {/*   <Link to="/about" className=""> */}
      {/*     About */}
      {/*   </Link> */}
      {/* </div> */}
      <hr />
      <Outlet />

      {!import.meta.env.PROD && (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools />
        </>
      )}
    </div>
  ),
});
