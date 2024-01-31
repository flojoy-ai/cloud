import { api } from "~/trpc/server";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type SelectUserInvite } from "~/types/user";
import { type SelectWorkspace } from "~/types/workspace";

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
  invite: SelectUserInvite & { workspace: SelectWorkspace };
}) => {
  return (
    <Card className="transition-all duration-300 hover:bg-secondary/80">
      <CardHeader>
        <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
          Invite to join {invite.workspace.name}
        </CardTitle>
        <CardDescription>{invite.workspace.id}</CardDescription>
      </CardHeader>
      <CardContent>{/* <Badge>{workspace.planType}</Badge> */}</CardContent>
      <CardFooter>
        {/* <div> */}
        {/*   Last updated:{" "} */}
        {/*   {workspace.updatedAt */}
        {/*     ? getPrettyTime(workspace.updatedAt) */}
        {/*     : "Never"} */}
        {/* </div> */}
      </CardFooter>
    </Card>
  );
};

export default InvitePage;
