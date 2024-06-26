import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { ParetoChart } from "@/components/visualization/pareto-chart";
import {
  getGlobalMetricsQueryOpts,
  getGlobalMetricsSessionTimeSeriesQueryOpts,
  getGlobalMetricsUserTimeSeriesQueryOpts,
} from "@/lib/queries/metrics";
import { getProjectsQueryOpts } from "@/lib/queries/project";
import { TimePeriod } from "@cloud/shared";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
// TODO: Treeshake
import { Card, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSeriesChart } from "@/components/visualization/time-series-chart";
import { makeTimeSeriesData } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { Box, Boxes, CircuitBoard, Cpu, LucideIcon, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import { pastTimeFromBin } from "@/lib/time";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/dashboard/",
)({
  component: DashboardPage,
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getGlobalMetricsQueryOpts({ context }));
    context.queryClient.ensureQueryData(
      getGlobalMetricsSessionTimeSeriesQueryOpts({ bin: "day", context }),
    );
    context.queryClient.ensureQueryData(
      getGlobalMetricsUserTimeSeriesQueryOpts({ bin: "day", context }),
    );
    context.queryClient.ensureQueryData(getProjectsQueryOpts({ context }));
  },
});

type MetricProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  className?: string;
};

const Metric = ({ title, value, icon: Icon, className }: MetricProps) => {
  return (
    <div className={cn("p-6", className)}>
      <div className="flex items-center gap-x-2">
        <Icon className="text-muted-foreground" size={16} />
        <div className="text-muted-foreground font-medium text-xs">{title}</div>
      </div>
      <div className="font-bold text-4xl text-center mt-2">{value}</div>
    </div>
  );
};

function DashboardPage() {
  const [sessionBin, setSessionBin] = useState<TimePeriod>("day");
  const [userBin, setUserBin] = useState<TimePeriod>("day");

  const context = Route.useRouteContext();
  const { workspace } = context;

  const { data: globalMetrics } = useSuspenseQuery(
    getGlobalMetricsQueryOpts({ context }),
  );

  const { data: sessionTimeSeries } = useQuery(
    getGlobalMetricsSessionTimeSeriesQueryOpts({
      bin: sessionBin,
      past: pastTimeFromBin(sessionBin),
      context,
    }),
  );

  const { data: userTimeSeries } = useQuery(
    getGlobalMetricsUserTimeSeriesQueryOpts({
      bin: userBin,
      past: pastTimeFromBin(userBin),
      context,
    }),
  );

  const [partsFailureX, partsFailureY] = makeTimeSeriesData({
    data: globalMetrics.partVariationFailureDistribution.sort(
      (a, b) => b.count - a.count,
    ),
    x: (p) => p.partNumber,
    y: (p) => p.count,
  });

  const [productsFailureX, productsFailureY] = makeTimeSeriesData({
    data: globalMetrics.productFailureDistribution.sort(
      (a, b) => b.count - a.count,
    ),
    x: (p) => p.name,
    y: (p) => p.count,
  });

  const sessionTimeSeriesData = sessionTimeSeries
    ? makeTimeSeriesData({
        data: sessionTimeSeries,
        x: (p) => p.bin,
        y: (p) => p.count,
      })
    : undefined;

  const userTimeSeriesData = userTimeSeries
    ? makeTimeSeriesData({
        data: userTimeSeries,
        x: (p) => p.bin,
        y: (p) => p.count,
      })
    : undefined;

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.fullPath} to=".">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="max-w-4xl mx-auto">
        <div className="py-2" />
        <Card className="rounded-xl h-fit mx-auto">
          <CardTitle className="pl-6 pt-6">Overview</CardTitle>
          <div className="grid grid-cols-5">
            <Metric
              title="Test sessions run"
              value={globalMetrics.testSessionCount}
              icon={Boxes}
            />
            <Metric
              title="Test results"
              value={globalMetrics.measurementCount}
              icon={Box}
            />
            <Metric
              title="Parts designed"
              value={globalMetrics.partVariationCount}
              icon={Cpu}
            />
            <Metric
              title="Units produced"
              value={globalMetrics.unitCount}
              icon={CircuitBoard}
            />
            <Metric
              title="Operators"
              value={globalMetrics.userCount}
              icon={User}
            />
          </div>
        </Card>
        <div className="py-2" />
        <div className="flex">
          <Card className="flex-1 rounded-xl p-4">
            {sessionTimeSeriesData && (
              <TimeSeriesChart
                bin={sessionBin}
                setBin={setSessionBin}
                title="Sessions over time"
                dates={sessionTimeSeriesData[0]}
                data={sessionTimeSeriesData[1]}
                totalCount={globalMetrics.testSessionCount}
              />
            )}
          </Card>
          <div className="px-2" />
          <Card className="flex-1 rounded-xl p-4">
            {userTimeSeriesData && (
              <TimeSeriesChart
                bin={userBin}
                setBin={setUserBin}
                title="Operators over time"
                dates={userTimeSeriesData[0]}
                data={userTimeSeriesData[1]}
                totalCount={globalMetrics.userCount}
              />
            )}
          </Card>
        </div>
        <div className="py-2" />
        <Card className="p-6">
          <CardTitle>Failures</CardTitle>
          <Tabs defaultValue="part" className="w-full">
            <div className="text-center">
              <TabsList>
                <TabsTrigger value="part">By Part</TabsTrigger>
                <TabsTrigger value="product">By Product</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="part">
              <ParetoChart labels={partsFailureX} values={partsFailureY} />
            </TabsContent>
            <TabsContent value="product">
              <ParetoChart
                labels={productsFailureX}
                values={productsFailureY}
              />
            </TabsContent>
          </Tabs>
          <div className="py-2" />
        </Card>
        <div className="py-6" />
      </div>
    </div>
  );
}
