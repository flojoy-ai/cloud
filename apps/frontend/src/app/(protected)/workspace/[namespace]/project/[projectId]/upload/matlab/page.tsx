import { Separator } from "@cloud/ui/components/ui/separator";

const UploadView = async ({ params }: { params: { projectId: string } }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">MATLAB Client</h3>
        <p className="text-sm text-muted-foreground">
          Upload measurement with Flojoy Cloud&apos;s MATLAB client
        </p>
      </div>
      <Separator />
    </div>
  );
};

export default UploadView;
