import { Outlet, createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/client";

export const Route = createFileRoute("/_protected/workspace/$namespace")({
  component: Page,
  beforeLoad: async ({ params: { namespace } }) => {
    const { data: workspace, error } = await client
      .workspace({
        namespace,
      })
      .get();
    if (error) throw error;
    return { workspace };
  },
});

function Page() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
