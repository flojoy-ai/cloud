import { Outlet, createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/client";

export const Route = createFileRoute("/_protected/workspace/$namespace")({
  component: Page,
  beforeLoad: async ({ params: { namespace } }) => {
    const { data: workspaceId, error } = await client.workspaces
      .id({ namespace })
      .get();
    if (error) throw error;
    return { workspaceId };
  },
});

function Page() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
