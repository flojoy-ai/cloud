import { useTheme } from "@/hooks/use-theme";
import { getCssVariable } from "@/lib/style";
import { Chart } from "chart.js";
import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";

type Props = {
  passed: number;
  failed: number;
  aborted: number;
  innerText: string;
};

export const StatusDoughnut = ({
  passed,
  failed,
  aborted,
  innerText,
}: Props) => {
  const ref = useRef<Chart<"doughnut", number[], string> | undefined>(null);
  const passColor = getCssVariable("--chart-pass");
  const failColor = getCssVariable("--chart-fail");
  const abortColor = getCssVariable("--chart-abort");

  const { theme } = useTheme();

  useEffect(() => {
    ref.current?.update();
  }, [theme]);

  return (
    <div className="h-full relative w-fit">
      <Doughnut
        ref={ref}
        data={{
          datasets: [
            {
              data: [passed, failed, aborted],
              backgroundColor: [
                `hsl(${passColor})`,
                `hsl(${failColor})`,
                `hsl(${abortColor})`,
              ],
            },
          ],
          labels: ["Passed", "Failed", "Aborted"],
        }}
        options={{
          cutout: "70%",
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
      <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 text-center -translate-y-1/2 mt-1">
        <span className="text-xl font-semibold">
          {passed + failed + aborted}
        </span>
        <br />
        <span className="text-muted-foreground">{innerText}</span>
      </div>
    </div>
  );
};
