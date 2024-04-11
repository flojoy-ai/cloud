import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@/components/ui/context-menu";
import CopyIdContextMenuItem from "@/components/copy-id-context-menu-item";
import { Workspace } from "@cloud/shared";
import { UserInvite } from "@cloud/shared/src/schemas/public/UserInvite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import {
  getWorkspaceInvitesQueryKey,
  getWorkspacesQueryKey,
} from "@/lib/queries/workspace";

type Props = {
  invite: UserInvite & { workspace: Workspace };
};

type InviteMutation = {
  workspaceId: string;
  accept: boolean;
};

export default function WorkspaceInvite({ invite }: Props) {
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteMutation) => {
      await client.workspace.invite.patch(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getWorkspaceInvitesQueryKey(),
      });
    },
  });

  function onJoin() {
    inviteMutation.mutateAsync({
      workspaceId: invite.workspace.id,
      accept: true,
    });
  }

  function onDecline() {
    inviteMutation.mutateAsync({
      workspaceId: invite.workspace.id,
      accept: false,
    });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
              {invite.workspace.name}
            </CardTitle>
            <CardDescription>{invite.workspace.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-1">
              <Badge>{invite.workspace.planType}</Badge>
              <div className="grow"></div>
              <Badge variant="red" onClick={onDecline}>
                Decline
              </Badge>
              <Badge variant="green" onClick={onJoin}>
                Join
              </Badge>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={invite.workspace.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
