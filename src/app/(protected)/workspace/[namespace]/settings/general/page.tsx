import { Separator } from "~/components/ui/separator";
import GeneralForm from "./_components/general-form";
import { api } from "~/trpc/server";

async function GeneralPage({ params }: { params: { namespace: string } }) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Update your workspace settings.
        </p>
      </div>
      <Separator />
      <GeneralForm workspaceId={workspaceId} />
    </div>
  );
}

export default GeneralPage;