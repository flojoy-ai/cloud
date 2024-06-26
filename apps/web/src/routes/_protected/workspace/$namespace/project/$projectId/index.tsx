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
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateBinSelect } from "@/components/visualization/date-bin-select";
import { StatusDoughnut } from "@/components/visualization/status-doughnut";
import { TimeSeriesBarChart } from "@/components/visualization/time-series-bar-chart";
import { useProjectUser } from "@/hooks/use-project-user";
import {
  getProjectMetricsQueryOpts,
  getProjectMetricsSeriesQueryOpts,
} from "@/lib/queries/metrics";
import { getPartVariationQueryOpts } from "@/lib/queries/part-variation";
import { getStationsQueryOpts } from "@/lib/queries/station";
import { makeTimeSeriesData } from "@/lib/stats";
import { pluralize } from "@/lib/string";
import { pastTimeFromBin } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Test, TimePeriod, Unit } from "@cloud/shared";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  CircleHelp,
  Copy,
  Cpu,
  GitPullRequest,
  Hash,
  IterationCcw,
  LucideIcon,
  PercentSquare,
  Settings,
  SigmaSquare,
  SquareCheck,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
        past: pastTimeFromBin("day"),
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
  description?: string;
  className?: string;
};

const Metric = ({
  icon: Icon,
  title,
  children,
  variant,
  description,
  className,
}: MetricProps) => {
  const titleContent = (
    <div className="flex gap-x-2 items-center text-nowrap">
      <Icon size={16} className="stroke-muted-foreground" />
      <h3
        className={cn(
          "text-muted-foreground",
          variant === "small" ? "text-xs" : "lg:text-sm text-xs",
        )}
      >
        {title}
      </h3>
    </div>
  );
  return (
    <div className={cn("min-w-fit", className)}>
      {description ? (
        <TooltipProvider>
          <Tooltip delayDuration={500}>
            <TooltipTrigger className="flex items-center gap-x-2">
              <div>{titleContent}</div>
              <CircleHelp
                size={variant === "large" ? 16 : 13}
                className="stroke-muted-foreground"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-muted-foreground max-w-48">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        titleContent
      )}
      {variant === "large" && <div className="py-0.5" />}
      <div
        className={cn(
          "font-semibold text-nowrap",
          variant === "small" ? "text-sm" : "lg:text-2xl text-lg",
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
  const { projectUser } = useProjectUser();

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

  const onRepoUrlCopy = () => {
    if (!project.repoUrl) {
      toast.error("No git repository URL set.");
      return;
    }

    toast.promise(navigator.clipboard.writeText(project.repoUrl), {
      success: "Copied git repository URL to clipboard.",
      error: "Failed to copy git repository URL.",
    });
  };

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
                Test Profiles
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
        <PageHeaderHeading>
          <div className="flex items-center gap-x-2">
            <div>{project.name}</div>
            <Link
              className="text-muted-foreground hover:bg-muted-foreground/5 md:p-2 p-1 rounded-md transition duration-200"
              from={Route.fullPath}
              to="settings"
              search={{ tab: "general" }}
            >
              <Settings className="md:h-8 md:w-8 h-6 w-6" />
            </Link>
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          <Badge>{projectUser.role}</Badge>
          <div className="py-1" />
          <div className="items-center flex text-sm font-medium">
            <GitPullRequest size={20} />
            <div className="px-1" />
            {project.repoUrl ? (
              <>
                <a
                  target="_blank"
                  className="hover:cursor-pointer underline"
                  href={project.repoUrl}
                >
                  {project.repoUrl}
                </a>
                <div className="px-0.5" />
                <Button
                  className="text-muted-foreground h-8 w-8"
                  size="icon"
                  variant="ghost"
                  onClick={onRepoUrlCopy}
                >
                  <Copy size={16} />
                </Button>
              </>
            ) : (
              <span>Git upstream not set</span>
            )}
          </div>
          <div className="py-1" />
          <div className="items-center flex text-sm font-medium">
            <IterationCcw size={20} />
            <div className="px-1" />
            <div>
              {project.numCycles === -1
                ? "Infinite"
                : `${project.numCycles} ${pluralize("cycle", project.numCycles)}`}
            </div>
          </div>
        </PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>
      <div className="">
        <div className="flex gap-x-4">
          <div className="max-w-fit">
            <Card className="p-6">
              <CardTitle className="text-muted-foreground lg:text-2xl text-xl">
                Part Stats
              </CardTitle>
              <div className="lg:py-3 py-2" />
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
                  title="Units under test"
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
                  description="The ratio of passed tests to total tests."
                >
                  {decimalToPercentString(metrics.testYield)}
                </Metric>
                <Metric
                  variant="large"
                  title="Avg. sessions per unit"
                  icon={SigmaSquare}
                  className="col-start-2 col-end-2 row-start-2 row-end-2"
                  description="The average number of test sessions run per unit."
                >
                  {metrics.meanSessionsPerUnit.toFixed(3)}
                </Metric>
              </div>
            </Card>
            <div className="lg:py-3 py-2" />
            <Card className="lg:p-6 p-4">
              <CardTitle className="text-muted-foreground lg:text-2xl text-xl">
                Test Session Stats
              </CardTitle>
              <div className="lg:py-3 py-2" />
              <div className="h-48 flex items-center lg:gap-x-6 gap-x-4">
                <StatusDoughnut
                  passed={metrics.sessionPassedCount}
                  failed={metrics.sessionFailedCount}
                  aborted={metrics.sessionAbortedCount}
                  innerText="sessions"
                  className="lg:h-full w-40"
                  numberClassName="lg:text-xl text-lg font-semibold"
                  innerTextClassName="lg:text-base text-sm"
                />
                <div className="flex flex-col gap-y-2">
                  <Metric
                    icon={PercentSquare}
                    title="First pass yield"
                    variant="small"
                    description="The ratio of passed 'first' sessions for a serial number to the number of units. ('first' meaning the first ever session for a unit.)"
                  >
                    {decimalToPercentString(metrics.firstPassYield)}
                  </Metric>
                  <Metric
                    icon={Timer}
                    title="Avg. cycle time per session"
                    variant="small"
                    description="The average execution time for a single cycle within a session."
                  >
                    {msToSecondsString(metrics.meanCycleTime)}
                  </Metric>
                  <Metric
                    icon={Timer}
                    title="Avg. time per session"
                    variant="small"
                    description="The average execution time for a session."
                  >
                    {msToSecondsString(metrics.meanSessionTime)}
                  </Metric>
                  <Metric
                    icon={Timer}
                    title="Total failed test time"
                    variant="small"
                    description="The sum of all execution times for failed tests."
                  >
                    {msToSecondsString(metrics.totalFailedTestTime)}
                  </Metric>
                </div>
              </div>
            </Card>
          </div>
          <Card className="flex-1 p-6 flex flex-col">
            <CardTitle className="text-muted-foreground lg:text-2xl text-xl">
              Stats Over Time
            </CardTitle>
            <div className="lg:py-3 py-2" />
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
            <div className="w-full flex-1">
              {seriesData && (
                <TimeSeriesBarChart
                  bin={bin}
                  dates={seriesData[0]}
                  data={seriesData[1]}
                  className="max-w-full"
                />
              )}
            </div>
          </Card>
        </div>

        <div className="py-3" />

        <div className="flex gap-x-6">
          <div className="flex-1">
            <div className="h-10 flex items-center">
              <h2 className="text-xl font-semibold">Tests</h2>
            </div>
            <div className="py-1" />
            <DataTable columns={testColumns} data={project.tests} />
          </div>
          <div className="max-w-fit lg:min-w-64 min-w-56">
            <div className="flex items-center gap-x-2">
              <h2 className="text-xl font-semibold">Stations</h2>
              <NewStation project={project} />
            </div>
            <div className="py-1" />
            <DataTable columns={columns} data={stations} />
            <div className="col-span-3"></div>
          </div>
          <div className="max-w-fit lg:min-w-64 min-w-56">
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
