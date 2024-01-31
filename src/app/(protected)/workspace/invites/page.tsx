import { api } from "~/trpc/server";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { type SelectUserInvite } from "~/types/user";

const InvitePage = async () => {
  const invites = await api.user.getAllWorkspaceInvites.query();

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Workspace Invites</PageHeaderHeading>
        <PageHeaderDescription>
          Here are all the pending invites.
        </PageHeaderDescription>
      </PageHeader>

      {invites.map((invite) => (
        <InviteCard key={invite.id} invite={invite} />
      ))}
    </div>
  );
};

const InviteCard = ({ invite }: { invite: SelectUserInvite }) => {
  return (
    <div>
      <div>{invite.email}</div>
      <div>{invite.role}</div>
    </div>
  );
};

export default InvitePage;
