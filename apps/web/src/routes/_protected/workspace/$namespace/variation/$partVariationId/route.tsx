import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getPartVariationQueryOpts } from "@/lib/queries/part-variation";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/variation/$partVariationId",
)({
  component: Page,

  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { partVariationId } }) => {
    const partVariation = await context.queryClient.ensureQueryData(
      getPartVariationQueryOpts({ partVariationId, context }),
    );
    return { partVariation };
  },
});

function Page() {
  return <Outlet />;
}
