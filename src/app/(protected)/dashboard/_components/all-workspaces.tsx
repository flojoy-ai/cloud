import WorkspaceSection from "./workspace-section";
import { type SelectWorkspace } from "~/types/workspace";

type Props = {
  workspaces: SelectWorkspace[];
};

export default async function AllWorkspaces({ workspaces }: Props) {
  return (
    <div>
      {workspaces
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((workspace) => {
          return <WorkspaceSection key={workspace.id} workspace={workspace} />;
        })}
    </div>
  );
}
