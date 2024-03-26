import { getModelOpts } from "@/lib/queries/model";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId/$modelId",
)({
  component: Page,
  beforeLoad: async ({ context, params: { modelId } }) => {
    const model = await context.queryClient.ensureQueryData(
      getModelOpts({ modelId, context }),
    );
    return { model };
  },
});

function Page() {
  return <Outlet />;
}
