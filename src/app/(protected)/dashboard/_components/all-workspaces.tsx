import { db } from "~/server/db";
import WorkspaceSection from "./workspace-section";
import { type SelectWorkspace } from "~/types/workspace";
import { type SelectProject } from "~/types/project";

type Props = {
  workspaces: SelectWorkspace[];
};

export default async function AllWorkspaces({ workspaces }: Props) {
  let projects = [] as SelectProject[];

  if (workspaces.length > 0) {
    projects = await db.query.project.findMany({
      where: (project, { inArray }) =>
        inArray(
          project.workspaceId,
          workspaces.flatMap((w) => w.id),
        ),
    });
  }

  return (
    <div>
      {workspaces
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((workspace) => {
          return (
            <WorkspaceSection
              key={workspace.id}
              workspace={workspace}
              projects={projects
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .filter((project) => project.workspaceId === workspace.id)}
            />
          );
        })}
    </div>
  );
}
