import { client } from "@/lib/client";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project",
)({
  beforeLoad: async ({ context }) => {
    const { data: projects, error } = await client.project.index.get({
      headers: { "flojoy-workspace-id": context.workspace.id },
    });
    if (error) {
      throw error;
    }
    return { projects };
  },
  component: Page,
});

function Page() {
  return <Outlet />;
}
