import { suffixSum } from "@/lib/stats";
import { TimePeriod } from "@cloud/shared";
import { Line } from "react-chartjs-2";
import { DateBinSelect } from "./date-bin-select";
import { getChartColors } from "@/lib/style";
import { useMemo } from "react";

type Props = {
  title?: string;
  bin: TimePeriod;
  setBin: (bin: TimePeriod) => void;
  data: number[];
  dates: Date[];
  totalCount: number;
};

const tooltipDisplayFormats = {
  day: "MMM d",
  week: "MMM d",
  month: "LLL yyyy",
  year: "yyyy",
};

export const TimeSeriesChart = ({
  title,
  bin,
  setBin,
  data,
  dates,
  totalCount,
}: Props) => {
  const { accent, accentLight } = getChartColors();

  const cumulativeData = useMemo(() => {
    const arr = data.slice(1);
    arr.push(0);
    return suffixSum(arr).map((x) => totalCount - x);
  }, [data, totalCount]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold">{title}</div>
        <DateBinSelect bin={bin} setBin={setBin} />
      </div>
      <div className="py-1" />
      <Line
        data={{
          datasets: [
            {
              data: cumulativeData,
              cubicInterpolationMode: "monotone",
            },
          ],
          labels: dates,
        }}
        options={{
          backgroundColor: `hsl(${accentLight})`,
          borderColor: `hsl(${accent})`,
          elements: {
            point: {
              radius: 0,
              hitRadius: 20,
            },
          },
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
              time: {
                tooltipFormat: tooltipDisplayFormats[bin],
                unit: bin,
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
    </div>
  );
};
