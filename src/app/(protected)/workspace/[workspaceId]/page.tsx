import { api } from "~/trpc/server";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import NewProject from "./_components/new-project";
import ProjectCard from "./_components/project-card";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function Page({
  params,
}: {
  params: { workspaceId: string };
}) {
  const workspace = await api.workspace.getWorkspaceById.query({
    workspaceId: params.workspaceId,
  });
  const projects = await api.project.getAllProjectsByWorkspaceId.query({
    workspaceId: params.workspaceId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{workspace.name}</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all the projects in this workspace. <br />
          Each project should host a single type of board with all its hardware
          instances.
        </PageHeaderDescription>
      </PageHeader>

      <div className="space-x-2">
        <NewProject workspace={workspace} />
        <Button asChild size="sm" variant="secondary">
          <Link href={`/workspace/${workspace.id}/settings/general`}>
            <div className="hidden md:block">Configure Workspace</div>
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
            <ProjectCard
              key={project.id}
              project={project}
              workspace={workspace}
            />
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
