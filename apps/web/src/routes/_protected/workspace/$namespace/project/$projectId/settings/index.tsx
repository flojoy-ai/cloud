import ProjectGeneral from "@/components/settings/project-general";
import ProjectUsers from "@/components/settings/project-users";
import { useProjectUser } from "@/hooks/use-project-user";
import { getProjectUsersQueryOpts } from "@/lib/queries/project";
import { getProjectUserQueryOpts } from "@/lib/queries/user";
import { getWorkspaceUsersQueryOpts } from "@/lib/queries/workspace";
import { projectSettingsTabSchema } from "@/types/setting";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/settings/",
)({
  validateSearch: (search) => {
    return projectSettingsTabSchema.parse(search);
  },
  loader: ({ context, params: { projectId } }) => {
    context.queryClient.ensureQueryData(
      getProjectUserQueryOpts({ context, projectId }),
    );
    context.queryClient.ensureQueryData(
      getProjectUsersQueryOpts({ context, projectId }),
    );
    context.queryClient.ensureQueryData(
      getWorkspaceUsersQueryOpts({ context }),
    );
  },
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  const context = Route.useRouteContext();
  const { workspace, project } = context;

  const { projectUserPerm } = useProjectUser();

  const { data: projectUsers } = useSuspenseQuery(
    getProjectUsersQueryOpts({ context, projectId: project.id }),
  );

  const { data: workspaceUsers } = useSuspenseQuery(
    getWorkspaceUsersQueryOpts({ context }),
  );

  return (
    <div className="">
      {tab === "general" && (
        <ProjectGeneral
          workspace={workspace}
          projectPerm={projectUserPerm}
          project={project}
        />
      )}
      {tab === "users" && (
        <ProjectUsers
          project={project}
          workspace={workspace}
          projectUsers={projectUsers}
          workspaceUsers={workspaceUsers}
          projectPerm={projectUserPerm}
        />
      )}
    </div>
  );
}
