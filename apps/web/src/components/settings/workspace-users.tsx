import { Workspace } from "@cloud/shared";

type Props = {
  workspace: Workspace;
};

const WorkspaceUsers = ({ workspace }: Props) => {
  console.log(workspace);
  return <div>WorkspaceUsers</div>;
};

export default WorkspaceUsers;
