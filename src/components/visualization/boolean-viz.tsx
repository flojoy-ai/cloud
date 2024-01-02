import { Card } from "~/components/ui/card";
import ScatterPlot from "~/components/visualization/plot/scatter-plot";
import LinePlot from "~/components/visualization/plot/line-plot";
import { type SelectTest } from "~/types/test";
import { type SelectMeasurement } from "~/types/measurement";

type Props = {
  measurements: SelectMeasurement[];
  selectedTest: SelectTest;
  everythingSelected: boolean;
};

const BooleanViz = ({
  measurements,
  selectedTest,
  everythingSelected,
}: Props) => {
  return (
    <Card className="p-2">
      {everythingSelected && measurements && (
        <ScatterPlot
          title={selectedTest?.name ?? "Untitled Test"}
          x={
            measurements.map(
              (measurement) => measurement.deviceId ?? "Untitled Device",
            ) ?? []
          }
          y={
            measurements.map((measurement) => {
              if (measurement.data.type === "boolean") {
                return measurement.data.passed ? "passed" : "failed";
              }
              return "";
            }) ?? []
          }
        />
      )}
    </Card>
  );
};

export default BooleanViz;
