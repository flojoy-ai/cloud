import { createFileRoute } from "@tanstack/react-router";
import { workspaceSettingsTabSchema } from "@/types/setting";
import WorkspaceGeneral from "@/components/settings/workspace-general";
import WorkspaceUsers from "@/components/settings/workspace-users";
import WorkspaceSecret from "@/components/settings/workspace-secret";
import { getSecretQueryOpts } from "@/lib/queries/secret";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getWorkspaceUsersQueryOpts } from "@/lib/queries/workspace";
import { Perm, workspaceRoleToPerm } from "@cloud/shared";
import { useWorkspaceUser } from "@/hooks/use-workspace-user";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/settings/",
)({
  validateSearch: (search) => {
    return workspaceSettingsTabSchema.parse(search);
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getSecretQueryOpts({ context }));
  },
  component: Page,
});

function Page() {
  const context = Route.useRouteContext();
  const { workspace } = context;

  const { data: secret } = useSuspenseQuery(getSecretQueryOpts({ context }));
  const { data: workspaceUsers } = useSuspenseQuery(
    getWorkspaceUsersQueryOpts({ context }),
  );

  const { tab } = Route.useSearch();

  const { workspaceUser } = useWorkspaceUser();

  const perm = new Perm(workspaceRoleToPerm(workspaceUser.role));

  return (
    <div className="">
      {tab === "general" && (
        <WorkspaceGeneral workspace={workspace} perm={perm} />
      )}
      {tab === "users" && (
        <WorkspaceUsers workspace={workspace} workspaceUsers={workspaceUsers} />
      )}
      {tab === "secret" && (
        <WorkspaceSecret workspace={workspace} secret={secret} />
      )}
    </div>
  );
}
