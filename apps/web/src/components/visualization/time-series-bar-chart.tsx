import { getChartColors } from "@/lib/style";
import { TimePeriod } from "@cloud/shared";
import { Bar } from "react-chartjs-2";

type Props = {
  title?: string;
  bin: TimePeriod;
  data: number[];
  dates: Date[];
  className?: string;
};

const tooltipDisplayFormats = {
  day: "MMM d",
  week: "MMM d",
  month: "LLL yyyy",
  year: "yyyy",
};

export const TimeSeriesBarChart = ({ className, bin, data, dates }: Props) => {
  const { accent, accentLight } = getChartColors();
  return (
    <Bar
      className={className}
      data={{
        datasets: [{ data }],
        labels: dates,
      }}
      options={{
        maintainAspectRatio: false,
        backgroundColor: `hsl(${accent})`,
        borderColor: `hsl(${accentLight})`,
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
  );
};
