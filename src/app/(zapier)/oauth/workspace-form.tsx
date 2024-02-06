"use client";
import React from "react";
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
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<string>("");
  const router = useRouter();
  const handleContinue = async () => {
    const url = new URL(redirect_uri);
    url.searchParams.append("code", selectedWorkspace);
    url.searchParams.append("state", state);
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
