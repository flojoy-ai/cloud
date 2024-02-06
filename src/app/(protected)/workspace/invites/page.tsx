import { api } from "~/trpc/server";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { AcceptInvite } from "./_components/accept-invite";
import { RejectInvite } from "./_components/reject-invite";
import { Workspace } from "~/schemas/public/Workspace";
import { UserInvite } from "~/schemas/public/UserInvite";

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

      {invites.length === 0 && (
        <div>You do not have any pending invites for the moment.</div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {invites.map((invite) => (
          <InviteCard key={invite.id} invite={invite} />
        ))}
      </div>
    </div>
  );
};

const InviteCard = ({
  invite,
}: {
  invite: UserInvite & { workspaceName: string };
}) => {
  return (
    <Card className="transition-all duration-300 hover:bg-secondary/80">
      <CardHeader>
        <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
          Invite to join {invite.workspaceName}
        </CardTitle>
        {/* <CardDescription>{invite.workspace.id}</CardDescription> */}
      </CardHeader>
      <CardFooter className="gap-2">
        <AcceptInvite workspaceId={invite.workspaceId} />
        <RejectInvite workspaceId={invite.workspaceId} />
      </CardFooter>
    </Card>
  );
};

export default InvitePage;
