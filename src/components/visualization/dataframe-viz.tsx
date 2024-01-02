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

const DataFrameViz = ({
  measurements,
  selectedTest,
  everythingSelected,
}: Props) => {
  return (
    <Card className="p-2">
      {everythingSelected && measurements && (
        <LinePlot
          title={selectedTest?.name ?? "Untitled Test"}
          // lines={[
          //   { x: [1, 2, 3], y: [1, 2, 3] },
          //   { x: [3, 2, 1], y: [1, 2, 3] },
          // ]}
          lines={
            measurements.map((measurement) => {
              if (measurement.data.type === "dataframe") {
                return {
                  x: measurement.data.dataframe.x ?? [],
                  y: measurement.data.dataframe.y ?? [],
                  name: measurement.deviceId,
                };
              }
              return { x: [], y: [], name: "" };
            }) ?? []
          }
        />
      )}
    </Card>
  );
};

export default DataFrameViz;
