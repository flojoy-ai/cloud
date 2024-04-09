import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getGlobalMetricsQueryOpts } from "@/lib/queries/metrics";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { PastTimePeriod } from "@cloud/shared";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/dashboard/",
)({
  component: DashboardPage,
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getGlobalMetricsQueryOpts({ context }));
  },
});

function DashboardPage() {
  const [past, setPast] = useState<PastTimePeriod>("day");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const context = Route.useRouteContext();

  const { data } = useSuspenseQuery(
    getGlobalMetricsQueryOpts({ past, context }),
  );

  return (
    <div>
      <div>Parts designed: {data.partVariationCount}</div>
      <div>Units produced: {data.unitCount}</div>
      <div>Test sessions run: {data.testSessionCount}</div>
      <div>Measurements taken: {data.measurementCount}</div>
      <div>Operators: {data.userCount}</div>
    </div>
  );
}
