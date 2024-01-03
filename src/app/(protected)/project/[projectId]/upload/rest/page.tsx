import { Separator } from "~/components/ui/separator";

const UploadView = async ({ params }: { params: { projectId: string } }) => {
  console.log(params.projectId);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">REST API</h3>
        <p className="text-sm text-muted-foreground">
          Upload measurement with Flojoy Cloud's REST API
        </p>
      </div>
      <Separator />
    </div>
  );
};

export default UploadView;
