"use client";
import { Separator } from "~/components/ui/separator";
import SyntaxHighlighter from "react-syntax-highlighter";
// import { useTheme } from "next-themes";
// import {
//   oneDark,
//   oneLight,
// } from "react-syntax-highlighter/dist/esm/styles/prism";

const code = `from flojoy_cloud import FlojoyCloud

client = FlojoyCloud(api_key="YOUR_API_KEY")

# test_name and device_name are both unique per project

test = client.get_test(test_name="PASS/FAIL Test", create_if_not_exist=True)

device = client.get_device(device_name="Circuit Board #1", create_if_not_exist=False)

data = {"passed": True}

client.upload(data, test, device)
`;

const UploadView = ({ params }: { params: { projectId: string } }) => {
  // const { theme } = useTheme();
  // if (!theme) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          Upload measurement with Flojoy Cloud's Python client
        </p>
      </div>
      <Separator />
      <SyntaxHighlighter language="python">{code}</SyntaxHighlighter>
    </div>
  );
};

export default UploadView;
