import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import ScatterPlot from "~/components/visualization/plot/scatter-plot";
import LinePlot from "~/components/visualization/plot/line-plot";
import { Badge } from "~/components/ui/badge";
import { type SelectTest } from "~/types/test";
import { useExplorerStore } from "~/store/explorer";
import { useShallow } from "zustand/react/shallow";
import { TestCombobox } from "./test-combobox";

type Props = {
  tests: SelectTest[];
};

const ExplorerVisualization = ({ tests }: Props) => {
  const { selectedTest } = useExplorerStore(
    useShallow((state) => ({
      selectedTest: state.selectedTest,
    })),
  );

  const { data: measurements } =
    api.measurement.getAllMeasurementsByTestId.useQuery({
      testId: selectedTest?.id ?? "",
    });

  const everythingSelected = selectedTest;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Select test</CardTitle>
          </CardHeader>
          <CardContent>
            <TestCombobox tests={tests ?? []} />
          </CardContent>
          <CardFooter>
            {tests?.length === 0 && (
              <div>There is no test in the selected project</div>
            )}
            {selectedTest && <Badge>{selectedTest.measurementType}</Badge>}
          </CardFooter>
        </Card>
      </div>

      {everythingSelected && (
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
      )}
    </div>
  );
};

export default ExplorerVisualization;
