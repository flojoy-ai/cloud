import { TimePeriod } from "@cloud/shared";
import { Bar } from "react-chartjs-2";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  title?: string;
  bin: TimePeriod;
  setBin: (bin: TimePeriod) => void;
  data: number[];
  dates: Date[];
};

const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const tooltipDisplayFormats = {
  day: "MMM d",
  week: "MMM d",
  month: "LLL yyyy",
  year: "yyyy",
};

export const TimeSeriesBarChart = ({
  title,
  bin,
  setBin,
  data,
  dates,
}: Props) => {
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
