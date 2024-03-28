import { Workspace } from "@cloud/shared";

type Props = {
  workspace: Workspace;
};

const WorkspaceGeneral = ({ workspace }: Props) => {
  console.log(workspace);
  return <div>WorkspaceGeneral</div>;
};

export default WorkspaceGeneral;
