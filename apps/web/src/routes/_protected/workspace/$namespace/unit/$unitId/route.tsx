import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getPartVariationQueryOpts } from "@/lib/queries/part-variation";
import { getUnitQueryOpts } from "@/lib/queries/unit";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/unit/$unitId",
)({
  component: () => <Outlet />,
  beforeLoad: async ({ context, params: { unitId } }) => {
    const unit = await context.queryClient.ensureQueryData(
      getUnitQueryOpts({ unitId, context }),
    );
    const partVariation = await context.queryClient.ensureQueryData(
      getPartVariationQueryOpts({
        partVariationId: unit.partVariationId,
        context,
      }),
    );
    return { unit, partVariation };
  },
  pendingComponent: CenterLoadingSpinner,
});
