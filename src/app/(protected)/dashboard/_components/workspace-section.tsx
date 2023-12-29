import { Label } from "~/components/ui/label";
import { type SelectWorkspace } from "~/types/workspace";

import ProjectCard from "./project-card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Settings } from "lucide-react";
import { api } from "~/trpc/server";

type Props = {
  workspace: SelectWorkspace;
};

export default async function WorkspaceSection({ workspace }: Props) {
  const projects = await api.project.getAllProjectsByWorkspaceId.query({
    workspaceId: workspace.id,
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <Label className="text-2xl">{workspace.name}</Label>
        <Badge>{workspace.planType} plan</Badge>
        <Label className="text-muted-foreground">{workspace.id}</Label>
        <div className="grow"></div>
        <Button asChild size="sm" variant="secondary">
          <Link href={`/workspace/${workspace.id}`} className="gap-2">
            <Settings size="16" />
            Configure Workspace
          </Link>
        </Button>
      </div>

      <div className="py-2"></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects
          .sort(
            (a, b) =>
              (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
          )
          .map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        {projects.length === 0 && (
          <div className="text-muted-foreground">
            No project found here, go create one!
          </div>
        )}
      </div>
    </div>
  );
}
