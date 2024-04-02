import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getStationQueryOpts } from "@/lib/queries/station";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/station/$stationId",
)({
  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { stationId } }) => {
    const station = await context.queryClient.ensureQueryData(
      getStationQueryOpts({ stationId, context }),
    );
    return { station };
  },
  component: () => <Outlet />,
});
