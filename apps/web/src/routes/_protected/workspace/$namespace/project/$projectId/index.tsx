import CenterLoadingSpinner from "@/components/center-loading-spinner";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { columns } from "@/components/station/columns";
import NewStation from "@/components/station/new-station";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateBinSelect } from "@/components/visualization/date-bin-select";
import { StatusDoughnut } from "@/components/visualization/status-doughnut";
import { TimeSeriesBarChart } from "@/components/visualization/time-series-bar-chart";
import {
  getProjectMetricsQueryOpts,
  getProjectMetricsSeriesQueryOpts,
} from "@/lib/queries/metrics";
import { getPartVariationQueryOpts } from "@/lib/queries/part-variation";
import { getStationsQueryOpts } from "@/lib/queries/station";
import { makeTimeSeriesData } from "@/lib/stats";
import { pastTimeFromBin } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Test, TimePeriod, Unit } from "@cloud/shared";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Cpu,
  Hash,
  LucideIcon,
  PercentSquare,
  SigmaSquare,
  SquareCheck,
  Timer,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/",
)({
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context, params: { projectId } }) => {
    context.queryClient.ensureQueryData(
      getStationsQueryOpts({ projectId, context }),
    );

    context.queryClient.ensureQueryData(
      getPartVariationQueryOpts({
        context,
        partVariationId: context.project.partVariationId,
      }),
    );

    context.queryClient.ensureQueryData(
      getProjectMetricsQueryOpts({
        context,
        projectId: context.project.id,
      }),
    );

    context.queryClient.ensureQueryData(
      getProjectMetricsSeriesQueryOpts({
        context,
        projectId: context.project.id,
        bin: "day",
      }),
    );
  },
  component: Page,
});

const testColumns: ColumnDef<Test>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Type",
    accessorKey: "measurementType",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          from={Route.fullPath}
          to={"/workspace/$namespace/test/$testId"}
          params={{ testId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];

const unitColumns: ColumnDef<Unit>[] = [
  {
    header: "Serial Number",
    accessorKey: "serialNumber",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.serialNumber}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          from={Route.fullPath}
          to={"/workspace/$namespace/unit/$unitId"}
          params={{ unitId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];

type MetricProps = {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  variant: "small" | "large";
  className?: string;
};

const Metric = ({
  icon: Icon,
  title,
  children,
  variant,
  className,
}: MetricProps) => {
  return (
    <div className={cn("min-w-fit", className)}>
      <div className="flex gap-x-2 items-center">
        <Icon size={16} className="stroke-muted-foreground" />
        <h3
          className={cn(
            "text-muted-foreground",
            variant === "small" ? "text-xs" : "text-sm",
          )}
        >
          {title}
        </h3>
      </div>
      {variant === "large" && <div className="py-0.5" />}
      <div
        className={cn(
          "font-semibold",
          variant === "small" ? "text-sm" : "text-2xl",
        )}
      >
        {children}
      </div>
    </div>
  );
};

const msToSecondsString = (ms: number) => `${(ms / 1000).toFixed(3)}s`;
const decimalToPercentString = (decimal: number) =>
  `${(decimal * 100).toFixed(2)}%`;

const SERIES_OPTIONS = {
  testSessionCount: "Session Count",
  unitCount: "Unit Count",
  meanSessionsPerUnit: "Mean Sessions Per Unit",
  sessionPassedCount: "Sessions Passed",
  sessionFailedCount: "Sessions Failed",
  sessionAbortedCount: "Sessions Aborted",
  meanCycleTime: "Mean Cycle Time",
  meanSessionTime: "Mean Session Time",
  totalFailedTestTime: "Total Failed Test Time",
  firstPassYield: "First Pass Yield",
  testYield: "Test Yield",
};

type SeriesOption = keyof typeof SERIES_OPTIONS;

function Page() {
  const { workspace, project } = Route.useRouteContext();
  const { projectId } = Route.useParams();

  const [bin, setBin] = useState<TimePeriod>("day");

  const { data: stations } = useSuspenseQuery(
    getStationsQueryOpts({ projectId, context: { workspace } }),
  );

  const { data: partVariation } = useSuspenseQuery(
    getPartVariationQueryOpts({
      context: { workspace },
      partVariationId: project.partVariationId,
    }),
  );

  const { data: metrics } = useSuspenseQuery(
    getProjectMetricsQueryOpts({ context: { workspace }, projectId }),
  );

  const { data: metricsSeries } = useQuery(
    getProjectMetricsSeriesQueryOpts({
      context: { workspace },
      projectId,
      past: pastTimeFromBin(bin),
      bin,
    }),
  );

  const [series, setSeries] = useState<SeriesOption>("testSessionCount");

  const seriesData = metricsSeries
    ? makeTimeSeriesData({
        data: metricsSeries[series],
        x: (d) => d.bin,
        y: (d) => d.val,
      })
    : undefined;

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../..">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="..">
                Production Lines
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">{project.name}</PageHeaderHeading>
        <PageHeaderDescription></PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-12 gap-x-4">
          <div className="col-span-5">
            <Card className="h-48 p-6">
              <div className="grid grid-cols-2 grid-rows-2 gap-6">
                <Metric
                  variant="large"
                  title="Part variation under test"
                  icon={Cpu}
                  className="col-start-1 col-end-1 row-start-1 row-end-1"
                >
                  <Link
                    className="hover:text-muted-foreground underline"
                    to="/workspace/$namespace/variation/$partVariationId"
                    params={{
                      namespace: workspace.namespace,
                      partVariationId: partVariation.id,
                    }}
                  >
                    {partVariation.partNumber}
                  </Link>
                </Metric>

                <Metric
                  variant="large"
                  title="Total number of units"
                  icon={Hash}
                  className="col-start-2 col-end-2 row-start-1 row-end-1"
                >
                  {project.units.length}
                </Metric>
                <Metric
                  variant="large"
                  title="Test yield"
                  icon={SquareCheck}
                  className="col-start-1 col-end-1 row-start-2 row-end-2"
                >
                  {decimalToPercentString(metrics.testYield)}
                </Metric>
                <Metric
                  variant="large"
                  title="Mean sessions per unit"
                  icon={SigmaSquare}
                  className="col-start-2 col-end-2 row-start-2 row-end-2"
                >
                  {metrics.meanSessionsPerUnit}
                </Metric>
                <div className="py-3" />
              </div>
            </Card>
            <div className="py-3" />
            <Card className="h-56 p-6 flex items-center gap-x-12">
              <StatusDoughnut
                passed={metrics.sessionPassedCount}
                failed={metrics.sessionFailedCount}
                aborted={metrics.sessionAbortedCount}
                innerText="sessions"
              />
              <div className="flex flex-col gap-y-2">
                <Metric
                  icon={PercentSquare}
                  title="First pass yield"
                  variant="small"
                >
                  {decimalToPercentString(metrics.firstPassYield)}
                </Metric>
                <Metric
                  icon={Timer}
                  title="Avg. cycle time per session"
                  variant="small"
                >
                  {msToSecondsString(metrics.meanCycleTime)}
                </Metric>
                <Metric
                  icon={Timer}
                  title="Avg. time per session"
                  variant="small"
                >
                  {msToSecondsString(metrics.meanSessionTime)}
                </Metric>
                <Metric
                  icon={Timer}
                  title="Total failed test time"
                  variant="small"
                >
                  {msToSecondsString(metrics.totalFailedTestTime)}
                </Metric>
              </div>
            </Card>
          </div>
          <Card className="col-span-7 p-6">
            <div className="flex justify-between items-center">
              <Select
                defaultValue={series}
                onValueChange={(val) => setSeries(val as SeriesOption)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERIES_OPTIONS).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DateBinSelect bin={bin} setBin={setBin} />
            </div>
            <div className="py-6" />
            {seriesData && (
              <TimeSeriesBarChart
                bin={bin}
                dates={seriesData[0]}
                data={seriesData[1]}
              />
            )}
          </Card>
        </div>

        <div className="py-3" />

        <div className="flex">
          <div className="w-1/3">
            <div className="flex items-center gap-x-2">
              <h2 className="text-xl font-semibold">Stations</h2>
              <NewStation project={project} />
            </div>
            <div className="py-1" />
            <DataTable columns={columns} data={stations} />
            <div className="col-span-3"></div>
          </div>
          <div className="px-3" />
          <div className="w-1/3">
            <div className="h-10 flex items-center">
              <h2 className="text-xl font-semibold">Tests</h2>
            </div>
            <div className="py-1" />
            <DataTable columns={testColumns} data={project.tests} />
          </div>
          <div className="px-3" />
          <div className="w-1/3">
            <div className="h-10 flex items-center">
              <h2 className="text-xl font-semibold">Units</h2>
            </div>
            <div className="py-1" />
            <DataTable columns={unitColumns} data={project.units} />
          </div>
        </div>
      </div>
    </div>
  );
}
