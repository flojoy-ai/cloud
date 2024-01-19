"use client";

import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { useState } from "react";
import { type SelectTest } from "~/types/test";
import { Label } from "~/components/ui/label";
import { Combobox } from "~/components/combobox";
import { type MeasurementDataType } from "~/types/data";
import CodeBlock from "~/components/code-block";
import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";
import { type SelectHardware } from "~/types/hardware";

const EXAMPLE_DATA: Record<MeasurementDataType, string> = {
  boolean: "Boolean(passed=True)",
  dataframe: "Dataframe(dataframe={'x': [1,2,3,4,5], 'y': [2,4,6,8,10]})",
};

const UploadView = ({
  params,
}: {
  params: { namespace: string; projectId: string };
}) => {
  const { data: workspaceId } =
    api.workspace.getWorkspaceIdByNamespace.useQuery({
      namespace: params.namespace,
    });

  const { data: tests } = api.test.getAllTestsByProjectId.useQuery({
    projectId: params.projectId,
  });

  const { data: devices } = api.hardware.getAllHardware.useQuery({
    workspaceId: workspaceId ?? "",
    projectId: params.projectId,
  });

  const [selectedTest, setSelectedTest] = useState<SelectTest | undefined>(
    undefined,
  );
  const [selectedDevice, setSelectedDevice] = useState<
    SelectHardware | undefined
  >(undefined);

  const code = `from flojoy.cloud import FlojoyCloud, Boolean, Dataframe

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

data = ${EXAMPLE_DATA[selectedTest?.measurementType ?? "boolean"]}

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
      <div className="grid grid-cols-2 gap-x-4">
        <div className="flex flex-col gap-2">
          <Label>Test</Label>
          <Combobox
            options={tests ?? []}
            value={selectedTest}
            setValue={setSelectedTest}
            displaySelector={(val) => val.name}
            valueSelector={(val) => val.id}
            placeholder="Select test"
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
            placeholder="Select device"
          />
        </div>
      </div>
      <Separator />
      <CodeBlock code={code} />
      <WorkspaceSecretReminder namespace={params.namespace} />
    </div>
  );
};

export default UploadView;
