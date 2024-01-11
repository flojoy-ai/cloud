"use client";

import { Separator } from "~/components/ui/separator";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { api } from "~/trpc/react";
import { useState } from "react";
import { type SelectTest } from "~/types/test";
import { Label } from "~/components/ui/label";
import { type SelectDevice } from "~/types/device";
import { Combobox } from "~/components/combobox";
import { type MeasurementDataType } from "~/types/data";
import Link from "next/link";
import { Clipboard } from "lucide-react";
import { toast } from "sonner";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

const EXAMPLE_DATA: Record<MeasurementDataType, string> = {
  boolean: "Boolean(passed=True)",
  dataframe: "Dataframe(dataframe={'x': [1,2,3,4,5], 'y': [2,4,6,8,10]})",
};

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

  const { resolvedTheme } = useTheme();

  const [selectedTest, setSelectedTest] = useState<SelectTest | undefined>(
    undefined,
  );
  const [selectedDevice, setSelectedDevice] = useState<
    SelectDevice | undefined
  >(undefined);

  const code = `from flojoy_cloud import FlojoyCloud

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
      <div className="relative">
        <Clipboard
          size={32}
          className="absolute right-4 top-4 cursor-pointer rounded-md bg-background/70 p-1 hover:bg-background/40"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied to clipboard!");
          }}
        />
        <SyntaxHighlighter
          language="python"
          style={resolvedTheme === "dark" ? oneDark : oneLight}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <div className="text-sm">
        To get your workspace secret, go to{" "}
        <Link
          href={`/workspace/${params.workspaceId}/settings/secret`}
          className="underline hover:opacity-70"
        >
          your workspace settings.
        </Link>
      </div>
    </div>
  );
};

export default UploadView;
