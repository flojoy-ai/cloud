import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { Card, CardTitle } from "@/components/ui/card";
import { ParetoChart } from "@/components/visualization/pareto-chart";
import { StatusDoughnut } from "@/components/visualization/status-doughnut";
import { getTestMeasurementsQueryOpts } from "@/lib/queries/test";
import { median, mode } from "@/lib/stats";
import { getChartColors } from "@/lib/style";
import { createFileRoute } from "@tanstack/react-router";
import _ from "lodash";
import { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import { DateTime } from "luxon";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/test/$testId/",
)({
  pendingComponent: CenterLoadingSpinner,
  loader: ({ context, params: { testId } }) => {
    context.queryClient.ensureQueryData(
      getTestMeasurementsQueryOpts({ context, testId }),
    );
  },
  component: TestPage,
});

const calculateStats = (distribution: number[]) => {
  return {
    mean: _.mean(distribution),
    median: median(distribution),
    mode: mode(distribution),
    min: _.min(distribution),
    max: _.max(distribution),
  };
};

const Stat = ({ name, value }: { name: string; value: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">{name}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
};

function TestPage() {
  const { test, workspace } = Route.useRouteContext();
  const { data: measurements } = useSuspenseQuery(
    getTestMeasurementsQueryOpts({
      testId: test.id,
      context: { workspace },
    }),
  );

  const {
    measurementSerialNumbers,
    distribution,
    time,
    passCount,
    failCount,
    serialNumbers,
    counts,
    stats,
  } = useMemo(() => {
    const sortedMeasurements = _.sortBy(measurements, (m) => m.createdAt);
    const measurementSerialNumbers = sortedMeasurements.map(
      (m) => m.serialNumber,
    );
    const distribution =
      test.measurementType === "scalar"
        ? measurements.map((m) => m.data.value as number)
        : undefined;
    const time = sortedMeasurements.map((m) => m.createdAt);

    const failed = measurements.filter((m) => m.pass === false);

    const passCount = measurements.filter((m) => m.pass === true).length;
    const failCount = failed.length;

    const groups = _.groupBy(failed, (f) => f.serialNumber);
    const serialNumbers = Object.keys(groups);
    const counts = Object.values(groups).map((g) => g.length);

    const stats = distribution ? calculateStats(distribution) : undefined;
    return {
      measurementSerialNumbers,
      distribution,
      time,
      passCount,
      failCount,
      serialNumbers,
      counts,
      stats,
    };
  }, [test, measurements]);

  const { accent, accentLight } = getChartColors();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="py-3" />
      <div className="flex h-96">
        <Card className="flex-1 p-6 pb-20 rounded-xl">
          <CardTitle>{test.name}</CardTitle>
          <div className="py-2" />
          {!distribution ? (
            <div className="text-lg font-medium p-6 text-muted-foreground h-full flex items-center justify-center">
              Overview is not yet supported for this data type (
              {test.measurementType})
            </div>
          ) : (
            <Scatter
              data={{ datasets: [{ data: distribution }], labels: time }}
              options={{
                backgroundColor: `hsl(${accent})`,
                borderColor: `hsl(${accentLight})`,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      title: (items) => {
                        const date = items[0].label as unknown as Date;
                        return DateTime.fromJSDate(date, {
                          zone: "Etc/GMT",
                        }).toFormat("FF");
                      },
                      label: (context) => {
                        const val = (context.raw as number).toFixed(4);
                        const sn = measurementSerialNumbers[context.dataIndex];
                        const time = DateTime.fromJSDate(
                          context.label as unknown as Date,
                          { zone: "Etc/GMT" },
                        ).toFormat("yyyy-MM-dd HH:mm:ss");
                        return `${val} (${sn}, ${time})`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    adapters: {
                      date: {
                        zone: "Etc/GMT",
                      },
                    },
                    type: "time",
                    ticks: {
                      autoSkip: false,
                    },
                    time: {
                      tooltipFormat: "MMM d",
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    ticks: {
                      precision: 0,
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          )}
        </Card>
        <div className="px-2" />
        <Card className="w-56 p-6">
          <div className="w-full h-1/2 flex justify-center">
            <StatusDoughnut
              passed={passCount}
              failed={failCount}
              aborted={0}
              innerText="Results"
            />
          </div>
          <div className="py-3" />
          <div className="flex flex-col gap-y-1">
            <Stat name="Mean" value={stats?.mean.toFixed(4) ?? "N/A"} />
            <Stat name="Median" value={stats?.median.toFixed(4) ?? "N/A"} />
            <Stat
              name="Mode"
              value={stats?.mode?.map((m) => m.toString()).join("; ") ?? "N/A"}
            />
            <Stat name="Min" value={stats?.min?.toFixed(4) ?? "N/A"} />
            <Stat name="Max" value={stats?.max?.toFixed(4) ?? "N/A"} />
          </div>
        </Card>
      </div>
      <div className="py-3" />
      <Card className="p-6">
        <CardTitle>Failures</CardTitle>
        <div className="py-2" />
        <ParetoChart labels={serialNumbers} values={counts} />
      </Card>
      <div className="py-3" />
    </div>
  );
}
