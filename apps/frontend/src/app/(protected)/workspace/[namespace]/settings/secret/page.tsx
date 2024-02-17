import { Input } from "@cloud/ui/components/ui/input";
import { Label } from "@cloud/ui/components/ui/label";
import { Separator } from "@cloud/ui/components/ui/separator";
import { api } from "~/trpc/server";
import GenerateSecret from "./_components/generate-secret";
import CopyButton from "./_components/copy-button";

async function GeneralPage({ params }: { params: { namespace: string } }) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const secret = await api.secret._getSecret.query({ workspaceId });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Secret</h3>
        <p className="text-sm text-muted-foreground">
          Your secret key to access this workspace.
        </p>
      </div>
      <Separator />

      <div className="grid w-full max-w-lg items-center gap-1.5">
        <Label htmlFor="workspace_id">Workspace ID</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            id="workspace_id"
            disabled
            placeholder={workspaceId}
          />
          <CopyButton value={workspaceId} />
        </div>
      </div>

      <div className="grid w-full max-w-lg items-center gap-1.5">
        <Label htmlFor="workspace_id">Workspace Secret</Label>

        <div className="flex items-center gap-2">
          {secret && (
            <>
              <Input
                type="text"
                id="workspace_id"
                disabled
                placeholder={secret.value}
                className="text-ellipsis"
                style={{ direction: "rtl" }}
              />
              <CopyButton value={secret.value} />
            </>
          )}
        </div>
        <GenerateSecret workspaceId={workspaceId} />
      </div>
    </div>
  );
}

export default GeneralPage;
