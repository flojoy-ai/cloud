import { Outlet, createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/client";

export const Route = createFileRoute("/_protected/workspace/$namespace")({
  component: Page,
  beforeLoad: async ({ params: { namespace } }) => {
    const workspaceQuery = await client
      .workspace({
        namespace,
      })
      .get();
    if (workspaceQuery.error) throw workspaceQuery.error;

    const modelsQuery = await client.model.index.get({
      headers: { "flojoy-workspace-id": workspaceQuery.data.id },
    });
    if (modelsQuery.error) throw modelsQuery.error;

    return { workspace: workspaceQuery.data, models: modelsQuery.data };
  },
});

function Page() {
  return <Outlet />;
}
