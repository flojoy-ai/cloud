import { Outlet, createFileRoute } from "@tanstack/react-router";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getTestQueryOpts } from "@/lib/queries/test";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/test/$testId",
)({
  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { testId } }) => {
    const test = await context.queryClient.ensureQueryData(
      getTestQueryOpts({ testId, context }),
    );
    return { test };
  },
  component: Page,
});

function Page() {
  return <Outlet />;
}
