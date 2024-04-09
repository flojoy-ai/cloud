import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { Combobox } from "@/components/ui/combobox";
import { ParetoChart } from "@/components/visualization/pareto-chart";
import {
  getGlobalMetricsQueryOpts,
  getGlobalMetricsSeriesQueryOpts,
  getProjectMetricsQueryOpts,
} from "@/lib/queries/metrics";
import { getProjectsQueryOpts } from "@/lib/queries/project";
import { Project, TimePeriod } from "@cloud/shared";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
// TODO: Treeshake
import "chart.js/auto";
import { Line } from "react-chartjs-2";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/dashboard/",
)({
  component: DashboardPage,
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getGlobalMetricsQueryOpts({ context }));
    context.queryClient.ensureQueryData(
      getGlobalMetricsSeriesQueryOpts({ bin: "day", context }),
    );
    context.queryClient.ensureQueryData(getProjectsQueryOpts({ context }));
  },
});

function DashboardPage() {
  const [past, setPast] = useState<TimePeriod>("day");
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const context = Route.useRouteContext();

  const { data: projects } = useSuspenseQuery(
    getProjectsQueryOpts({ context }),
  );

  const { data: globalMetrics } = useSuspenseQuery(
    getGlobalMetricsQueryOpts({ past, context }),
  );

  const [bin, setBin] = useState<TimePeriod>("day");
  const { data: globalMetricsSeries } = useSuspenseQuery(
    getGlobalMetricsSeriesQueryOpts({ bin, context }),
  );

  const { data: projectMetrics } = useQuery(
    getProjectMetricsQueryOpts({ projectId: project?.id ?? "", context }),
  );

  const partsFailureLabels = [];
  const partsFailureValues = [];
  for (const partFailure of globalMetrics.partVariationFailureDistribution) {
    partsFailureLabels.push(partFailure.partNumber);
    partsFailureValues.push(partFailure.count);
  }

  const productsFailureLabels = [];
  const productsFailureValues = [];
  for (const productFailure of globalMetrics.productFailureDistribution) {
    productsFailureLabels.push(productFailure.name);
    productsFailureValues.push(productFailure.count);
  }

  const sessionsOverTimeX = [];
  const sessionsOverTimeY = [];
  for (const { bin, count } of globalMetricsSeries.sessionCountOverTime) {
    sessionsOverTimeX.push(bin);
    sessionsOverTimeY.push(count);
  }

  return (
    <div>
      <div>Parts designed: {globalMetrics.partVariationCount}</div>
      <div>Units produced: {globalMetrics.unitCount}</div>
      <div>Test sessions run: {globalMetrics.testSessionCount}</div>
      <div>Measurements taken: {globalMetrics.measurementCount}</div>
      <div>Operators: {globalMetrics.userCount}</div>
      <div>Part failure pareto:</div>
      <div className="max-w-xl">
        <ParetoChart labels={partsFailureLabels} values={partsFailureValues} />
      </div>
      <div>Product failure pareto:</div>
      <div className="max-w-xl">
        <ParetoChart
          labels={productsFailureLabels}
          values={productsFailureValues}
        />
      </div>
      <div>Session count over time</div>
      <Line
        // options={{
        //   scales: {
        //     x: {
        //       type: "timeseries",
        //     },
        //   },
        // }}
        data={{
          datasets: [{ data: sessionsOverTimeY }],
          labels: sessionsOverTimeX,
        }}
      />

      <div className="py-4" />
      <h2>Project Metrics</h2>
      <Combobox
        options={projects}
        value={project}
        setValue={setProject}
        displaySelector={(p) => p.name}
        valueSelector={(p) => p.id}
        placeholder="Select a project..."
      />
      {projectMetrics && (
        <div>
          <div>Test sessions run: {projectMetrics.testSessionCount}</div>
          <div>Units: {projectMetrics.unitCount}</div>
          <div>
            Mean test sessions per unit: {projectMetrics.meanSessionsPerUnit}
          </div>
          <div>Session pass count: {projectMetrics.sessionPassedCount}</div>
          <div>Session fail count: {projectMetrics.sessionFailedCount}</div>
          <div>Session aborted count: {projectMetrics.sessionAbortedCount}</div>
          <div>Mean cycle time: {projectMetrics.meanCycleTime}ms</div>
          <div>Mean test time: {projectMetrics.meanSessionTime}ms</div>
          <div>
            Total time of failed tests: {projectMetrics.totalFailedTestTime}ms
          </div>
          <div>First pass yield: {projectMetrics.firstPassYield}</div>
          <div>Test yield: {projectMetrics.testYield}</div>
        </div>
      )}
    </div>
  );
}
