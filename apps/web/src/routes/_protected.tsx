import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { ProtectedHeader } from "@/components/navbar/protected-header";
import { getWorkspacesQueryOpts } from "@/lib/queries/workspace";
import {
  Navigate,
  Outlet,
  createFileRoute,
  useMatchRoute,
  useRouter,
} from "@tanstack/react-router";

import { getWorkspaceInvitesQueryOpts } from "@/lib/queries/workspace";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected")({
  component: Protected,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getWorkspacesQueryOpts());
    context.queryClient.ensureQueryData(getWorkspaceInvitesQueryOpts());
  },
  pendingComponent: CenterLoadingSpinner,
  errorComponent: () => <Navigate to="/login" />,
});

function Protected() {
  const workspacesQuery = useSuspenseQuery(getWorkspacesQueryOpts());
  const { data: workspaces } = workspacesQuery;

  const { data: invites } = useSuspenseQuery(getWorkspaceInvitesQueryOpts());

  const matchRoute = useMatchRoute();

  const router = useRouter();

  // this makes sure that the toast only fires once in strict mode
  const hasFired = useRef(false);
  useEffect(() => {
    if (hasFired.current) {
      return;
    }
    hasFired.current = true;

    if (invites.length !== 0 && !matchRoute({ to: "/workspace" })) {
      toast(`You have ${invites.length} pending workspace invite(s)!`, {
        action: {
          label: "Check",
          onClick: () => {
            router.navigate({ to: "/workspace" });
          },
        },
        duration: Infinity,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ProtectedHeader workspaces={workspaces} />
      <Outlet />
    </div>
  );
}
