import { Separator } from "~/components/ui/separator";

function UserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Users</h3>
        <p className="text-sm text-muted-foreground">
          Manage users in the current workspace.
        </p>
      </div>
      <Separator />
      <div>We are still working on this functionality, coming soon!</div>
    </div>
  );
}

export default UserPage;
