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
  return (
    <div className="h-full relative w-fit">
      <Doughnut
        data={{
          datasets: [
            {
              data: [passed, failed, aborted],
              backgroundColor: ["#4ade80", "#f87171", "#94a3b8"],
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
