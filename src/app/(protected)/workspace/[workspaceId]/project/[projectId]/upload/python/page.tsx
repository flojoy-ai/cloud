"use client";
import { Separator } from "~/components/ui/separator";
import SyntaxHighlighter from "react-syntax-highlighter";
import { api } from "~/trpc/react";
import { useState } from "react";
import { type SelectTest } from "~/types/test";
import { Label } from "~/components/ui/label";
import { type SelectDevice } from "~/types/device";
import { Combobox } from "~/components/combobox";
import {
  type MeasurementDataType,
  allMeasurementDataTypes,
} from "~/types/data";

const EXAMPLE_DATA: Record<MeasurementDataType, string> = {
  boolean: "Boolean(passed=True)",
  dataframe: "Dataframe(dataframe={'x': [1,2,3,4,5], 'y': [2,4,6,8,10]})",
};

function identity<T>(val: T) {
  return val;
}

const UploadView = ({
  params,
}: {
  params: { workspaceId: string; projectId: string };
}) => {
  const { data: tests } = api.test.getAllTestsByProjectId.useQuery({
    projectId: params.projectId,
  });
  const { data: devices } = api.device.getAllDevices.useQuery({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
  });

  const [selectedTest, setSelectedTest] = useState<SelectTest | undefined>(
    undefined,
  );
  const [selectedDevice, setSelectedDevice] = useState<
    SelectDevice | undefined
  >(undefined);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<
    MeasurementDataType | undefined
  >(undefined);

  const code = `from flojoy_cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

data = ${EXAMPLE_DATA[selectedMeasurementType ?? "boolean"]}

test_id = "${selectedTest?.id ?? "TEST_ID"}"

device_id = "${selectedDevice?.id ?? "DEVICE_ID"}"

client.upload(data, test_id, device_id)
`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          Upload measurement with Flojoy Cloud's Python client
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <div className="flex flex-col gap-2">
          <Label>Test</Label>
          <Combobox
            options={tests ?? []}
            value={selectedTest}
            setValue={setSelectedTest}
            displaySelector={(val) => val.name}
            valueSelector={(val) => val.id}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Device</Label>
          <Combobox
            options={devices ?? []}
            value={selectedDevice}
            setValue={setSelectedDevice}
            displaySelector={(val) => val.name}
            valueSelector={(val) => val.id}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Measurement type</Label>
          <Combobox
            options={allMeasurementDataTypes.slice()}
            value={selectedMeasurementType}
            setValue={setSelectedMeasurementType}
            displaySelector={identity}
            valueSelector={identity}
          />
        </div>
      </div>
      <Separator />
      <SyntaxHighlighter language="python">{code}</SyntaxHighlighter>
    </div>
  );
};

export default UploadView;
