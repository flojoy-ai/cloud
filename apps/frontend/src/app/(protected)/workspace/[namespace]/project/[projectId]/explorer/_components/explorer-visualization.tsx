"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import BooleanViz from "~/components/visualization/boolean-viz";
import DataFrameViz from "~/components/visualization/dataframe-viz";
import { useState } from "react";
import { DateTimeRangePicker } from "~/components/date-time-range-picker";
import { type DateRange } from "react-day-picker";
import { Combobox } from "~/components/combobox";
import CodeBlock from "~/components/code-block";
import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import _ from "lodash";
import { Test } from "~/schemas/public/Test";
import ScalarViz from "~/components/visualization/scalar-viz";

type Props = {
  tests: Test[];
  workspaceId: string;
  namespace: string;
};

const ExplorerVisualization = ({ tests, workspaceId, namespace }: Props) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [onlyShowLatest, setOnlyShowLatest] = useState<boolean>(false);

  const [selectedTest, setSelectedTest] = useState<Test | undefined>(undefined);

  const { data } = api.measurement.getAllMeasurementsByTestId.useQuery(
    {
      testId: selectedTest?.id ?? "",
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    },
    {
      keepPreviousData: true, // Prevents flickering
    },
  );

  const measurements = onlyShowLatest
    ? _.uniqBy(
        _.orderBy(data, (m) => m.createdAt, "desc"),
        (m) => m.hardwareId,
      )
    : data;

  const code = `from flojoy.cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

# Per test
measurements = client.get_all_measurements_by_test_id("${
    selectedTest?.id ?? "TEST_ID"
  }")

# Per device
measurements = client.get_all_measurements_by_hardware_id("HARDWARE_ID")
`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Select Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Combobox
              options={tests ?? []}
              value={selectedTest}
              setValue={setSelectedTest}
              displaySelector={(val) => val.name}
              valueSelector={(val) => val.id}
            />
          </CardContent>
          <CardFooter>
            {tests?.length === 0 && (
              <div>There is no test in the selected project</div>
            )}
            {selectedTest && <Badge>{selectedTest.measurementType}</Badge>}
          </CardFooter>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Select Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DateTimeRangePicker date={dateRange} setDate={setDateRange} />
            <div className="py-2" />
            <div className="flex items-center gap-x-2">
              <Checkbox
                checked={onlyShowLatest}
                onCheckedChange={(state) =>
                  setOnlyShowLatest(state.valueOf() as boolean)
                }
              />
              <Label>Only show latest measurement per device</Label>
            </div>
          </CardContent>
          <CardFooter>
            {selectedTest && (
              <div>
                {measurements?.length ?? 0} measurement(s) found in this time
                range
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {selectedTest?.measurementType === "boolean" ? (
        <BooleanViz
          measurements={measurements ?? []}
          title={selectedTest?.name}
          workspaceId={workspaceId}
        />
      ) : selectedTest?.measurementType === "dataframe" ? (
        <DataFrameViz
          measurements={measurements ?? []}
          title={selectedTest?.name}
          workspaceId={workspaceId}
        />
      ) : selectedTest?.measurementType === "scalar" ? (
        <ScalarViz
          measurements={measurements ?? []}
          title={selectedTest?.name}
          workspaceId={workspaceId}
        />
      ) : null}

      <div className="py-2" />
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          To do further analysis, download this data with Flojoy Cloud&apos;s
          Python client.
        </p>
      </div>
      <div>
        <CodeBlock code={code} />
        <WorkspaceSecretReminder namespace={namespace} />
      </div>
      <div className="py-8" />
    </div>
  );
};

export default ExplorerVisualization;
