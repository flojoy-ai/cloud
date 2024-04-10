import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import { prefixSum } from "@/lib/stats";

type Props = {
  labels: string[];
  values: number[];
};

export const ParetoChart = ({ labels, values }: Props) => {
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
            data: prefixSum(values),
          },
        ],
        labels,
      }}
      options={{
        plugins: {
          legend: {
            display: false,
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
        },
      }}
    />
  );
};
