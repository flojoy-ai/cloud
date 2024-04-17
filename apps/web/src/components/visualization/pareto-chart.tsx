import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import { prefixSum } from "@/lib/stats";
import { getChartColors } from "@/lib/style";

type Props = {
  labels: string[];
  values: number[];
};

export const ParetoChart = ({ labels, values }: Props) => {
  const cumulative = prefixSum(values);
  const total = cumulative[cumulative.length - 1];
  const { accent, accentLight, accent2 } = getChartColors();

  return (
    <Chart
      type="bar"
      data={{
        datasets: [
          {
            type: "bar",
            label: "Individual",
            data: values,
            backgroundColor: `hsl(${accent} / 80%)`,
            borderColor: `hsl(${accentLight})`,
          },
          {
            type: "line",
            label: "Cumulative",
            data: cumulative,
            backgroundColor: `hsl(${accent2})`,
            borderColor: `hsl(${accent2})`,
          },
        ],
        labels,
      }}
      options={{
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              footer: (tooltipItems) => {
                let diffPercent: string = "";
                let cumulativePercent: string = "";
                for (const item of tooltipItems) {
                  const val = (((item.raw as number) / total) * 100).toFixed(2);
                  if (item.datasetIndex === 0) {
                    diffPercent = val;
                  } else {
                    cumulativePercent = val;
                  }
                }
                return `Total: ${cumulativePercent}% (+${diffPercent}%)`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            grid: {
              display: false,
            },
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
          y1: {
            type: "linear",
            position: "right",
            ticks: {
              callback: (value) => {
                return value + "%";
              },
            },
            min: 0,
            max: 100,
          },
        },
      }}
    />
  );
};
