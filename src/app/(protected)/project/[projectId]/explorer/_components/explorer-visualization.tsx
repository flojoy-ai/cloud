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
import { type SelectTest } from "~/types/test";
import { useExplorerStore } from "~/store/explorer";
import { useShallow } from "zustand/react/shallow";
import { TestCombobox } from "./test-combobox";
import BooleanViz from "~/components/visualization/boolean-viz";
import DataFrameViz from "~/components/visualization/dataframe-viz";
import { useState } from "react";
import { DateTimeRangePicker } from "~/components/date-time-range-picker";
import { type DateRange } from "react-day-picker";

type Props = {
  tests: SelectTest[];
};

const ExplorerVisualization = ({ tests }: Props) => {
  const { selectedTest } = useExplorerStore(
    useShallow((state) => ({
      selectedTest: state.selectedTest,
    })),
  );
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const { data: measurements } =
    api.measurement.getAllMeasurementsByTestId.useQuery(
      {
        testId: selectedTest?.id ?? "",
        startDate: date?.from,
        endDate: date?.to,
      },
      {
        queryKey: ["measurements", selectedTest?.id, date],
        keepPreviousData: true,
      },
    );

  const everythingSelected = selectedTest !== undefined;

  if (!measurements) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Select Test</CardTitle>
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

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Select Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DateTimeRangePicker date={date} setDate={setDate} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>

      {selectedTest?.measurementType === "boolean" ? (
        <BooleanViz
          measurements={measurements}
          selectedTest={selectedTest}
          everythingSelected={everythingSelected}
        />
      ) : selectedTest?.measurementType === "dataframe" ? (
        <DataFrameViz
          measurements={measurements}
          selectedTest={selectedTest}
          everythingSelected={everythingSelected}
        />
      ) : null}
    </div>
  );
};

export default ExplorerVisualization;
