import { Link } from "@tanstack/react-router";
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

type Props = {
  workspace: Workspace;
};

export default function WorkspaceCard({ workspace }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          to={`/workspace/$namespace`}
          params={{ namespace: workspace.namespace }}
        >
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
                {workspace.name}
              </CardTitle>
              <CardDescription>{workspace.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{workspace.planType}</Badge>
            </CardContent>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={workspace.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
