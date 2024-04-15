import { Workspace } from "@cloud/shared";
import { Button } from "../ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { getSecretQueryKey } from "@/lib/queries/secret";
import { UserSession } from "@cloud/shared/src/schemas/public/UserSession";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Icons } from "../icons";

type Props = {
  workspace: Workspace;
  secret: UserSession | null;
};

const WorkspaceSecret = ({ workspace, secret }: Props) => {
  const queryClient = useQueryClient();
  const passwordRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (!secret) {
      generateSecret.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Workspace ID</CardTitle>
          <CardDescription>
            The workspace ID is a unique identifier for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder={workspace.id} disabled data-1p-ignore />
        </CardContent>
        <CardFooter className="space-x-4 border-t px-6 py-4">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(workspace.id);
              toast.success("Copied to clipboard");
            }}
          >
            Copy
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Workspace Personal Secret</CardTitle>
          <CardDescription>
            This is used to authenticate Flojoy Studio with your cloud
            workspace.
            <br /> If you click &quot;Regenerate&quot;, the old secret will be
            invalidated.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            ref={passwordRef}
            value={secret?.id ?? "Loading..."}
            type="password"
            disabled
            data-1p-ignore
          />
          <Button
            variant="secondary"
            id="togglePassword"
            onClick={() => {
              const input = passwordRef.current;
              if (input) {
                input.type = input.type === "password" ? "text" : "password";
              }
            }}
          >
            👁️
          </Button>
        </CardContent>
        <CardFooter className="space-x-4 border-t px-6 py-4">
          <Button onClick={handleGenerate} disabled={!secret}>
            {secret ? "Regenerate" : <Icons.spinner className="h-6 w-6" />}
          </Button>
          {secret && (
            <Button
              onClick={() => {
                navigator.clipboard.writeText(secret.id);
                toast.success("Copied to clipboard");
              }}
            >
              Copy
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkspaceSecret;
