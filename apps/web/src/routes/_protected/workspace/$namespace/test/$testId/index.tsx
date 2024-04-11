import CenterLoadingSpinner from "@/components/center-loading-spinner";
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderDescription,
} from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ParetoChart } from "@/components/visualization/pareto-chart";
import { StatusDoughnut } from "@/components/visualization/status-doughnut";
import { getTestMeasurementsQueryOpts } from "@/lib/queries/test";
import { median, mode } from "@/lib/stats";
import { Test, Measurement } from "@cloud/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import _ from "lodash";
import { useMemo } from "react";
import { Line, Scatter } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

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

const getDistribution = (measurements: Measurement[]) => {
  return measurements.map((m) => m.data.value as number);
};

const calculateStats = (test: Test, distribution: number[]) => {
  // if (test.measurementType !== "scalar") return undefined;

  return {
    mean: _.mean(distribution),
    median: median(distribution),
    mode: mode(distribution),
    min: _.min(distribution),
    max: _.max(distribution),
  };
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const Stat = ({ name, value }: { name: string; value: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">{name}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
};

const SERIAL_NUMBERS = _.range(10).map(() => faker.word.noun());

function randn_bm() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
}

const measurements = _.range(400).map(() => ({
  serialNumber: faker.helpers.arrayElements(SERIAL_NUMBERS),
  data: { value: randn_bm() },
  pass: faker.helpers.arrayElement([true, false, null]),
  aborted: faker.helpers.arrayElement([true, false]),
  createdAt: faker.date.recent(),
}));

function TestPage() {
  const { test, workspace } = Route.useRouteContext();
  // const { data: measurements } = useSuspenseQuery(
  //   getTestMeasurementsQueryOpts({
  //     testId: test.id,
  //     context: { workspace },
  //   }),
  // );
  const distribution = useMemo(
    () => measurements.map((m) => m.data.value as number),
    [],
  );
  const time = measurements.map((m) => m.createdAt).sort();
  const failed = measurements.filter((m) => m.pass === false);

  const passCount = measurements.filter((m) => m.pass === true).length;
  const failCount = failed.length;
  const abortedCount = measurements.filter((m) => m.aborted).length;

  const groups = _.groupBy(failed, (f) => f.serialNumber);
  const counts = SERIAL_NUMBERS.map((sn) => groups[sn]?.length ?? 0);

  const stats = useMemo(
    () => calculateStats(test, distribution),
    [test, distribution],
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="py-3" />
      {!stats ? (
        <Card className="text-center text-2xl font-semibold p-6">
          Overview is not supported for this data type yet
        </Card>
      ) : (
        <div className="flex h-96">
          <Card className="flex-1 p-6 pb-20 rounded-xl">
            <h1 className="text-2xl font-semibold">{test.name}</h1>
            <div className="py-2" />
            <Scatter
              data={{ datasets: [{ data: distribution }], labels: time }}
              options={{
                plugins: {
                  legend: {
                    display: false,
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
          </Card>
          <div className="px-2" />
          <Card className="w-56 p-6">
            <div className="w-full h-1/2 flex justify-center">
              <StatusDoughnut
                passed={passCount}
                failed={failCount}
                aborted={abortedCount}
                innerText="Results"
              />
            </div>
            <div className="py-3" />
            <div className="flex flex-col gap-y-1">
              <Stat name="Mean" value={stats.mean.toFixed(4)} />
              <Stat name="Median" value={stats.median.toFixed(4)} />
              <Stat
                name="Mode"
                value={stats.mode?.map((m) => m.toString()).join("; ") ?? "N/A"}
              />
              <Stat name="Min" value={stats.min?.toFixed(4) ?? "N/A"} />
              <Stat name="Max" value={stats.max?.toFixed(4) ?? "N/A"} />
            </div>
          </Card>
        </div>
      )}
      <div className="py-3" />
      <Card className="p-6">
        <h2 className="text-xl font-semibold">Failures</h2>
        <div className="py-2" />
        <ParetoChart labels={SERIAL_NUMBERS} values={counts} />
      </Card>
      <div className="py-3" />
    </div>
  );
}
