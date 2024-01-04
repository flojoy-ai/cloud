import { Separator } from "~/components/ui/separator";

async function GeneralPage({ params }: { params: { workspaceId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Secret</h3>
        <p className="text-sm text-muted-foreground">
          Your secret key to access this workspace.
        </p>
      </div>
      <Separator />
    </div>
  );
}

export default GeneralPage;
