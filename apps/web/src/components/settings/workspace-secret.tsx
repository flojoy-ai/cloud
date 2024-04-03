import { Workspace } from "@cloud/shared";
import { Secret } from "@cloud/shared/src/schemas/public/Secret";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { getSecretQueryKey } from "@/lib/queries/secret";

type Props = {
  workspace: Workspace;
  secret: Secret | null;
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
    <div className="">
      <Button onClick={handleGenerate}>Generate</Button>
      {secret && (
        <Button onClick={() => navigator.clipboard.writeText(secret.value)}>
          Copy
        </Button>
      )}
      <div className="whitespace-pre-wrap break-words">{secret?.value}</div>
      <div className="whitespace-pre-wrap break-words">{workspace.id}</div>
    </div>
  );
};

export default WorkspaceSecret;
