"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cloud/ui/components/ui/select";
import { Button } from "@cloud/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { type OAuthSearchParams } from "./page";
import { api } from "~/trpc/react";
import { Workspace } from "~/schemas/public/Workspace";

type WorkspaceFormProps = {
  workspaces: Workspace[];
  searchParams: OAuthSearchParams;
};
const WorkspaceForm = ({
  workspaces,
  searchParams: { redirect_uri, state },
}: WorkspaceFormProps) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const router = useRouter();
  const query = api.secret._getSecret.useQuery({
    workspaceId: selectedWorkspace,
  });
  const mutate = api.secret._createSecret.useMutation();
  const handleContinue = async () => {
    let workspaceSecret = (await query.refetch()).data?.value;

    if (!workspaceSecret) {
      workspaceSecret = (
        await mutate.mutateAsync({
          workspaceId: selectedWorkspace,
        })
      ).value;
    }

    const url = new URL(redirect_uri);
    url.searchParams.append("code", selectedWorkspace);
    url.searchParams.append("state", state);
    url.searchParams.append("workspace_secret", workspaceSecret);
    router.push(url.toString());
  };
  return (
    <>
      <Select onValueChange={setSelectedWorkspace}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {`${workspace.name} (/${workspace.namespace})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleContinue} disabled={!selectedWorkspace}>
        Continue
      </Button>
    </>
  );
};

export default WorkspaceForm;
