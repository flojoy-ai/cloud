import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type Props = {
  workspace: Workspace;
};

const WorkspaceGeneral = ({ workspace }: Props) => {
  console.log(workspace);
  return <div>WorkspaceGeneral</div>;
};

export default WorkspaceGeneral;
