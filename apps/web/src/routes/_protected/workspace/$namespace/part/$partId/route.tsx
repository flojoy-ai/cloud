import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getPartQueryOpts } from "@/lib/queries/part";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/part/$partId",
)({
  pendingComponent: CenterLoadingSpinner,
  component: Page,
  beforeLoad: async ({ context, params: { partId } }) => {
    const part = await context.queryClient.ensureQueryData(
      getPartQueryOpts({ partId, context }),
    );
    return { part };
  },
});

function Page() {
  return <Outlet />;
}
