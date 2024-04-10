import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import { prefixSum } from "@/lib/stats";

type Props = {
  labels: string[];
  values: number[];
};

export const ParetoChart = ({ labels, values }: Props) => {
  const cumulative = prefixSum(values);
  const total = cumulative[cumulative.length - 1];
  return (
    <Chart
      type="bar"
      data={{
        datasets: [
          {
            type: "bar",
            label: "Individual",
            data: values,
          },
          {
            type: "line",
            label: "Cumulative",
            data: cumulative,
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
