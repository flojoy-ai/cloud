import ProjectGeneral from "@/components/settings/project-general";
import ProjectUsers from "@/components/settings/project-users";
import { useWorkspaceUser } from "@/hooks/use-workspace-user";
import { getProjectUsersQueryOpts } from "@/lib/queries/project";
import { getProjectUserQueryOpts } from "@/lib/queries/user";
import { projectSettingsTabSchema } from "@/types/setting";
import { Perm, workspaceRoleToPerm } from "@cloud/shared";
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
  },
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  const context = Route.useRouteContext();
  const { workspace, project } = context;

  const { workspaceUser } = useWorkspaceUser();

  const workspacePerm = new Perm(workspaceRoleToPerm(workspaceUser.role));

  const { data: projectUsers } = useSuspenseQuery(
    getProjectUsersQueryOpts({ context, projectId: project.id }),
  );

  return (
    <div className="">
      {tab === "general" && (
        <ProjectGeneral
          workspace={workspace}
          workspacePerm={workspacePerm}
          projectPerm={workspacePerm}
          project={project}
        />
      )}
      {tab === "users" && (
        <ProjectUsers workspace={workspace} projectUsers={projectUsers} />
      )}
    </div>
  );
}
