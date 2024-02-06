import Link from "next/link";
import CopyIdContextMenuItem from "~/components/copy-id-context-menu";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "~/components/ui/context-menu";
import { Workspace } from "~/schemas/public/Workspace";
// import { getPrettyTime } from "~/lib/time";
import { type SelectModel } from "~/types/model";
import { type SelectProject } from "~/types/project";

type Props = {
  project: SelectProject;
  workspace: Workspace;
  models: SelectModel[];
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
                <Badge variant="outline">{model?.type}</Badge>
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
