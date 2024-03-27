import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type Props = {
  workspace: Workspace;
};

const WorkspaceSecret = ({ workspace }: Props) => {
  console.log(workspace);
  return <div>WorkspaceSecret</div>;
};

export default WorkspaceSecret;
