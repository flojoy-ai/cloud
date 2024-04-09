import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { Combobox } from "@/components/ui/combobox";
import {
  getGlobalMetricsQueryOpts,
  getProjectMetricsQueryOpts,
} from "@/lib/queries/metrics";
import { getProjectsQueryOpts } from "@/lib/queries/project";
import { PastTimePeriod, Project } from "@cloud/shared";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/dashboard/",
)({
  component: DashboardPage,
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getGlobalMetricsQueryOpts({ context }));
    context.queryClient.ensureQueryData(getProjectsQueryOpts({ context }));
  },
});

function DashboardPage() {
  const [past, setPast] = useState<PastTimePeriod>("day");
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
  console.log(project);

  const { data: projectMetrics } = useQuery(
    getProjectMetricsQueryOpts({ projectId: project?.id ?? "", context }),
  );

  return (
    <div>
      <div>Parts designed: {globalMetrics.partVariationCount}</div>
      <div>Units produced: {globalMetrics.unitCount}</div>
      <div>Test sessions run: {globalMetrics.testSessionCount}</div>
      <div>Measurements taken: {globalMetrics.measurementCount}</div>
      <div>Operators: {globalMetrics.userCount}</div>
      <div>
        Part variation pareto:{" "}
        {Object.entries(
          globalMetrics.partVariationFailureDistribution[0],
        ).toString()}
      </div>
      <div>
        Product pareto:{" "}
        {Object.entries(globalMetrics.productFailureDistribution[0]).toString()}
      </div>

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
