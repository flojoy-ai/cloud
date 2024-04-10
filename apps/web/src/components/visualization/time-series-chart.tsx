import { TimePeriod } from "@cloud/shared";
import { Line } from "react-chartjs-2";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { prefixSum } from "@/lib/stats";

type Props = {
  title?: string;
  bin: TimePeriod;
  setBin: (bin: TimePeriod) => void;
  data: number[];
  dates: Date[];
};

const tooltipDisplayFormats = {
  day: "MMM d",
  week: "MMM d",
  month: "LLL yyyy",
  year: "yyyy",
};

export const TimeSeriesChart = ({ title, bin, setBin, data, dates }: Props) => {
  const cumulative = prefixSum(data);
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold">{title}</div>
        <ToggleGroup size="sm" type="single" value={bin} onValueChange={setBin}>
          <ToggleGroupItem className="text-muted-foreground" value="day">
            D
          </ToggleGroupItem>
          <ToggleGroupItem className="text-muted-foreground" value="week">
            W
          </ToggleGroupItem>
          <ToggleGroupItem className="text-muted-foreground" value="month">
            M
          </ToggleGroupItem>
          <ToggleGroupItem className="text-muted-foreground" value="year">
            Y
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="py-1" />
      <Line
        data={{
          datasets: [
            {
              data: cumulative,
              cubicInterpolationMode: "monotone",
            },
          ],
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
    </div>
  );
};
