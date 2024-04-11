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

type Props = {
  invite: UserInvite & { workspace: Workspace };
};

export default function WorkspaceInvite({ invite }: Props) {
  function onJoin() {}
  function onDecline() {}

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
