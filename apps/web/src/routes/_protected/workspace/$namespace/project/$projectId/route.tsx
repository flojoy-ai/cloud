import { Outlet, createFileRoute } from "@tanstack/react-router";
import { getProjectQueryOpts } from "@/lib/queries/project";
import CenterLoadingSpinner from "@/components/center-loading-spinner";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId",
)({
  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { projectId } }) => {
    const project = await context.queryClient.ensureQueryData(
      getProjectQueryOpts({ projectId, context }),
    );
    return { project };
  },
  component: Page,
});

function Page() {
  return <Outlet />;
}
