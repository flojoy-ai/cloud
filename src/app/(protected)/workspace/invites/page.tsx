import { api } from "~/trpc/server";

const InvitePage = async () => {
  const invites = await api.user.getAllWorkspaceInvites.query();

  return (
    <div className="container max-w-screen-2xl">
      {invites.map((invite) => (
        <div key={invite.id}>
          <div>{invite.email}</div>
          <div>{invite.role}</div>
        </div>
      ))}
    </div>
  );
};

export default InvitePage;
