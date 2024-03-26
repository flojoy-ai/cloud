import { Outlet, createFileRoute } from "@tanstack/react-router";
import { getWorkspaceQueryOpts } from "@/lib/queries/workspace";

export const Route = createFileRoute("/_protected/workspace/$namespace")({
  component: Page,
  beforeLoad: async ({ context: { queryClient }, params: { namespace } }) => {
    const workspace = await queryClient.ensureQueryData(
      getWorkspaceQueryOpts({ namespace }),
    );
    return { workspace };
  },
});

function Page() {
  return <Outlet />;
}
