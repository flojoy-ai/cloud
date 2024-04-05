import CopyIdContextMenuItem from "@/components/copy-id-context-menu";
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
import { PartVariation, Project, Workspace } from "@cloud/shared";
import { Link } from "@tanstack/react-router";

type Props = {
  project: Project;
  workspace: Workspace;
  partVariations: PartVariation[];
};

export function ProjectCard({ project, workspace, partVariations }: Props) {
  const partVariation = partVariations.find(
    (partVariation) => partVariation.id === project.partVariationId,
  );
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          to={"/workspace/$namespace/project/$projectId"}
          params={{ namespace: workspace.namespace, projectId: project.id }}
        >
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge>{partVariation?.partNumber}</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <CopyIdContextMenuItem value={project.id} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
