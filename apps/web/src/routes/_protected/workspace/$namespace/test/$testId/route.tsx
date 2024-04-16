import { Outlet, createFileRoute } from "@tanstack/react-router";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getTestQueryOpts } from "@/lib/queries/test";
import { getProjectQueryOpts } from "@/lib/queries/project";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/test/$testId",
)({
  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { testId } }) => {
    const test = await context.queryClient.ensureQueryData(
      getTestQueryOpts({ testId, context }),
    );
    const project = await context.queryClient.ensureQueryData(
      getProjectQueryOpts({ projectId: test.projectId, context }),
    );
    return { test, project };
  },
  component: Page,
});

function Page() {
  return <Outlet />;
}
