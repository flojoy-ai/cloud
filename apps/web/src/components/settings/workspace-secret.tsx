import { Workspace } from "@cloud/shared";

type Props = {
  workspace: Workspace;
};

const WorkspaceSecret = ({ workspace }: Props) => {
  console.log(workspace);
  return <div>WorkspaceSecret</div>;
};

export default WorkspaceSecret;
