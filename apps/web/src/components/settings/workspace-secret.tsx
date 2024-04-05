import { Workspace } from "@cloud/shared";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { getSecretQueryKey } from "@/lib/queries/secret";
import { UserSession } from "@cloud/shared/src/schemas/public/UserSession";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";

type Props = {
  workspace: Workspace;
  secret: UserSession | null;
};

const WorkspaceSecret = ({ workspace, secret }: Props) => {
  const queryClient = useQueryClient();
  const generateSecret = useMutation({
    mutationFn: async () => {
      await client.secret.index.post(
        {},
        { headers: { "flojoy-workspace-id": workspace.id } },
      );

      queryClient.invalidateQueries({ queryKey: getSecretQueryKey() });
    },
  });

  function handleGenerate() {
    generateSecret.mutate();
  }

  return (
    <div className="space-y-8">
      <div className="grid w-full max-w-lg items-center gap-1.5">
        <Label htmlFor="workspace_id">Workspace ID</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            id="workspace_id"
            disabled
            placeholder={workspace.id}
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(workspace.id);
              toast.success("Copied to clipboard");
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      <div className="grid w-full max-w-lg items-center gap-1.5">
        <Label htmlFor="workspace_personal_secret">
          Workspace Personal Secret
        </Label>

        <div className="flex items-center gap-2">
          {secret && (
            <>
              <Input
                type="text"
                id="workspace_personal_secret"
                disabled
                placeholder={secret.id}
                className="text-ellipsis"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(secret.id);
                  toast.success("Copied to clipboard");
                }}
              >
                Copy
              </Button>
            </>
          )}
        </div>
        <Button onClick={handleGenerate}>
          {secret ? "Regenerate" : "Generate"}
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceSecret;
