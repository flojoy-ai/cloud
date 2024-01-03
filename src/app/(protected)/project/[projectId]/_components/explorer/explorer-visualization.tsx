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
import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";
import { matchesDateFilter } from "~/lib/time";

type Props = {
  tests: SelectTest[];
};

const ExplorerVisualization = ({ tests }: Props) => {
  const { selectedTest } = useExplorerStore(
    useShallow((state) => ({
      selectedTest: state.selectedTest,
    })),
  );
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: measurements } =
    api.measurement.getAllMeasurementsByTestId.useQuery({
      testId: selectedTest?.id ?? "",
    });

  const everythingSelected = selectedTest !== undefined;

  if (!measurements) return null;

  const showingMeasurements = measurements.filter(
    matchesDateFilter(startDate, endDate),
  );

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
            <div className="flex items-center gap-x-2">
              <Label className="font-semibold">Filter by date: </Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Start date"
              />
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="End date"
              />
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>

      {selectedTest?.measurementType === "boolean" ? (
        <BooleanViz
          measurements={showingMeasurements}
          selectedTest={selectedTest}
          everythingSelected={everythingSelected}
        />
      ) : selectedTest?.measurementType === "dataframe" ? (
        <DataFrameViz
          measurements={showingMeasurements}
          selectedTest={selectedTest}
          everythingSelected={everythingSelected}
        />
      ) : null}
    </div>
  );
};

export default ExplorerVisualization;
