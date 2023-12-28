import { Label } from "~/components/ui/label";
import { type SelectProject } from "~/types/project";
import { type SelectWorkspace } from "~/types/workspace";

import ProjectCard from "./project-card";
import { Badge } from "~/components/ui/badge";

type Props = {
  workspace: SelectWorkspace;
  projects: SelectProject[];
};

export default async function WorkspaceSection({ workspace, projects }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Label className="text-2xl">{workspace.name}</Label>
        <Badge>{workspace.planType}</Badge>
        <Label className="text-muted-foreground">{workspace.id}</Label>
      </div>

      <div className="py-2"></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <div className="text-muted-foreground">
            No project found here, go create one!
          </div>
        )}
      </div>
      <div className="py-2"></div>
    </div>
  );
}
