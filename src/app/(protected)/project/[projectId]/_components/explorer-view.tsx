"use client";

import { useShallow } from "zustand/react/shallow";
import { useExplorerStore } from "~/store/explorer";
import { TestCombobox } from "./explorer/test-combobox";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import ScatterPlot from "~/components/visualization/scatter-plot";
import { type SelectProject } from "~/types/project";
import LinePlot from "~/components/visualization/line-plot";
import { Badge } from "~/components/ui/badge";

type Props = {
  project: SelectProject;
};
const ExplorerView = ({ project }: Props) => {
  const { selectedTest } = useExplorerStore(
    useShallow((state) => ({
      selectedTest: state.selectedTest,
    })),
  );

  const { data: tests } = api.test.getAllTestsByProjectId.useQuery({
    projectId: project.id,
  });

  const { data: measurements } =
    api.measurement.getAllMeasurementsByTestId.useQuery({
      testId: selectedTest?.id ?? "",
    });

  const everythingSelected = selectedTest;

  return (
    <div>
      <div className="py-1"></div>

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
    </div>
  );
};

export default ExplorerView;
