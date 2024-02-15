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
// import { getPrettyTime } from "~/lib/time";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "~/components/ui/context-menu";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
import { Workspace } from "~/schemas/public/Workspace";

type Props = {
  workspace: Workspace;
};

export default function WorkspaceCard({ workspace }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/workspace/${workspace.namespace}`}>
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
              {/* <div> */}
              {/*   Last updated:{" "} */}
              {/*   {workspace.updatedAt */}
              {/*     ? getPrettyTime(workspace.updatedAt) */}
              {/*     : "Never"} */}
              {/* </div> */}
            </CardFooter>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={workspace.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
