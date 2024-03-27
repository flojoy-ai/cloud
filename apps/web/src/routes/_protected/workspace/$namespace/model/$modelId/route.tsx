import { getModelQueryOpts } from "@/lib/queries/model";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/model/$modelId",
)({
  component: Page,
  beforeLoad: async ({ context, params: { modelId } }) => {
    const model = await context.queryClient.ensureQueryData(
      getModelQueryOpts({ modelId, context }),
    );
    return { model };
  },
});

function Page() {
  return <Outlet />;
}