import { Separator } from "~/components/ui/separator";
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
        .map((workspace, idx) => {
          return (
            <div key={workspace.id}>
              {idx !== 0 && <Separator />}
              <div className="py-2" />
              <WorkspaceSection workspace={workspace} />
              <div className="py-2" />
            </div>
          );
        })}
    </div>
  );
}
