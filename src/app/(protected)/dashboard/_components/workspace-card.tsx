import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getPrettyTime } from "~/lib/time";
import { type SelectWorkspace } from "~/types/workspace";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import CopyIdContextMenu from "~/components/copy-id-context-menu";

type Props = {
  workspace: SelectWorkspace;
};

export default async function WorkspaceCard({ workspace }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/workspace/${workspace.id}`}>
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
            <CardFooter>
              <div>
                Last updated:{" "}
                {workspace.updatedAt
                  ? getPrettyTime(workspace.updatedAt)
                  : "Never"}
              </div>
            </CardFooter>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <CopyIdContextMenu value={workspace.id} />
    </ContextMenu>
  );
}
