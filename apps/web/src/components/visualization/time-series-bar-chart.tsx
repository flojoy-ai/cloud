import { TimePeriod } from "@cloud/shared";
import { Bar } from "react-chartjs-2";

type Props = {
  title?: string;
  bin: TimePeriod;
  data: number[];
  dates: Date[];
};

const tooltipDisplayFormats = {
  day: "MMM d",
  week: "MMM d",
  month: "LLL yyyy",
  year: "yyyy",
};

export const TimeSeriesBarChart = ({ bin, data, dates }: Props) => {
  return (
    <Bar
      data={{
        datasets: [{ data }],
        labels: dates,
      }}
      options={{
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
