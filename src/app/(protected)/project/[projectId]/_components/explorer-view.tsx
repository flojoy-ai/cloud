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
          </CardFooter>
        </Card>
      </div>

      {everythingSelected && (
        <ScatterPlot
          title={selectedTest?.name ?? "Untitled Test"}
          x={
            measurements?.flatMap(
              (measurement) => measurement.deviceId ?? "Untitled Device",
            ) ?? []
          }
          y={
            measurements?.flatMap((measurement) =>
              // TODO: Bad type casting, need to find a better way
              (measurement.data as { passed: boolean }).passed
                ? "Passed"
                : "Failed",
            ) ?? []
          }
        />
      )}
    </div>
  );
};

export default ExplorerView;
