import Link from "next/link";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
import { Badge } from "@cloud/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@cloud/ui/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@cloud/ui/components/ui/context-menu";
import { Model } from "~/schemas/public/Model";
import { Project } from "~/schemas/public/Project";
import { Workspace } from "~/schemas/public/Workspace";
// import { getPrettyTime } from "~/lib/time";

type Props = {
  project: Project;
  workspace: Workspace;
  models: Model[];
};

export default async function ProjectCard({
  project,
  workspace,
  models,
}: Props) {
  const model = models.find((model) => model.id === project.modelId);
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          href={`/workspace/${workspace.namespace}/project/${project.id}/hardwares`}
        >
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {/* TODO: model type? */}
                {/* <Badge variant="outline">{model?.type}</Badge> */}
                <Badge>{model?.name}</Badge>
              </div>
            </CardContent>
            {/* <CardFooter> */}
            {/*   <div> */}
            {/*     Last updated:{" "} */}
            {/*     {project.updatedAt ? getPrettyTime(project.updatedAt) : "Never"} */}
            {/*   </div> */}
            {/* </CardFooter> */}
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={project.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
