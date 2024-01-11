import Link from "next/link";
import CopyIdContextMenu from "~/components/copy-id-context-menu";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { getPrettyTime } from "~/lib/time";
import { type SelectProject } from "~/types/project";
import { type SelectWorkspace } from "~/types/workspace";

type Props = {
  project: SelectProject;
  workspace: SelectWorkspace;
};

export default async function ProjectCard({ project, workspace }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/workspace/${workspace.id}/project/${project.id}/devices`}>
          <Card className="transition-all duration-300 hover:bg-secondary/80">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.id}</CardDescription>
            </CardHeader>
            <CardFooter>
              <div>
                Last updated:{" "}
                {project.updatedAt ? getPrettyTime(project.updatedAt) : "Never"}
              </div>
            </CardFooter>
          </Card>
        </Link>
      </ContextMenuTrigger>
      <CopyIdContextMenu value={project.id} />
    </ContextMenu>
  );
}
