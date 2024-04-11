import { createFileRoute } from "@tanstack/react-router";
import { workspaceSettingsTabSchema } from "@/types/setting";
import WorkspaceGeneral from "@/components/settings/workspace-general";
import WorkspaceUsers from "@/components/settings/workspace-users";
import WorkspaceSecret from "@/components/settings/workspace-secret";
import { getSecretQueryOpts } from "@/lib/queries/secret";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getWorkspaceUsersQueryOpts } from "@/lib/queries/workspace";
import {
  Perm,
  WorkspaceUserWithUser,
  workspaceRoleToPerm,
} from "@cloud/shared";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();

  const { data: secret } = useSuspenseQuery(getSecretQueryOpts({ context }));
  const { data: workspaceUsers } = useSuspenseQuery(
    getWorkspaceUsersQueryOpts({ context }),
  );

  const { tab } = Route.useSearch();

  const [currentWorkspaceUser, setCurrentWorkspaceUser] = useState<
    WorkspaceUserWithUser | undefined
  >(undefined);

  useEffect(() => {
    const currentWorkspaceUser = workspaceUsers?.find(
      (u) => u.userId === user?.id,
    );
    setCurrentWorkspaceUser(currentWorkspaceUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, workspaceUsers]);

  if (!currentWorkspaceUser) {
    return;
  }

  const perm = new Perm(workspaceRoleToPerm(currentWorkspaceUser.role));

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
