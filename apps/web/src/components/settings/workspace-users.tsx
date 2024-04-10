import { Workspace, WorkspaceUser } from "@cloud/shared";
import { User } from "@cloud/shared/src/schemas/public/User";

type Props = {
  workspace: Workspace;
  workspaceUsers: (WorkspaceUser & { user: User })[];
};

const WorkspaceUsers = ({ workspace, workspaceUsers }: Props) => {
  console.log(workspace);
  return (
    <div>
      {workspaceUsers.map((wu) => (
        <div>{wu.user.email}</div>
      ))}
    </div>
  );
};

export default WorkspaceUsers;
