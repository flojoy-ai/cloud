"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { selectWorkspaceSchema } from "~/types/workspace";
import { selectWorkspaceUserSchema } from "~/types/workspace_user";
import { useRouter } from "next/navigation";
import { type OAuthSearchParams } from "./page";
import { api } from "~/trpc/react";

const workspaceSchema = z.array(
  selectWorkspaceSchema.merge(selectWorkspaceUserSchema.pick({ role: true })),
);
type WorkspaceFormProps = {
  workspaces: z.infer<typeof workspaceSchema>;
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
              {workspace.namespace}
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
