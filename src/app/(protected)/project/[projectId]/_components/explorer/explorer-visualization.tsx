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

  const everythingSelected = selectedTest !== undefined;

  if (!measurements) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="w-80 gap-4">
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
