import { Outlet, createFileRoute } from "@tanstack/react-router";
import { getProjectQueryOpts } from "@/lib/queries/project";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getProjectUserQueryOpts } from "@/lib/queries/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectUserProvider } from "@/context/project-user";

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
  loader: ({ context, params: { projectId } }) => {
    context.queryClient.ensureQueryData(
      getProjectUserQueryOpts({ projectId, context }),
    );
  },
  component: Page,
});

function Page() {
  const { workspace } = Route.useRouteContext();
  const { projectId } = Route.useParams();

  const { data: projectUser } = useSuspenseQuery(
    getProjectUserQueryOpts({ projectId, context: { workspace } }),
  );
  return (
    <ProjectUserProvider projectUser={projectUser}>
      <Outlet />
    </ProjectUserProvider>
  );
}
