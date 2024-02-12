import { Workspace } from "~/schemas/public/Workspace";
import WorkspaceCard from "./workspace-card";

type Props = {
  workspaces: Workspace[];
};

export default async function AllWorkspaces({ workspaces }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {workspaces
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((workspace) => {
          return <WorkspaceCard key={workspace.id} workspace={workspace} />;
        })}
    </div>
  );
}
