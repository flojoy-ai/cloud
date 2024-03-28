import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type Props = {
  workspace: Workspace;
};

const WorkspaceUsers = ({ workspace }: Props) => {
  console.log(workspace);
  return <div>WorkspaceUsers</div>;
};

export default WorkspaceUsers;
