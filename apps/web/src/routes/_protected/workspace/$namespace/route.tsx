import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { getWorkspaceQueryOpts } from "@/lib/queries/workspace";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Button } from "@/components/ui/button";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { handleError } from "@/lib/utils";

export const Route = createFileRoute("/_protected/workspace/$namespace")({
  component: Page,

  errorComponent: ({ error, reset }) => {
    return (
      <PageHeader>
        <PageHeaderHeading>Oops!</PageHeaderHeading>
        <PageHeaderDescription>An error occurred :(</PageHeaderDescription>
        <div className="py-2"></div>
        <div className="text-red-500">{handleError(error)}</div>
        <div className="py-2"></div>
        <Button asChild onClick={reset}>
          <Link to="/workspace">Go back</Link>
        </Button>
      </PageHeader>
    );
  },

  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context: { queryClient }, params: { namespace } }) => {
    const workspace = await queryClient.ensureQueryData(
      getWorkspaceQueryOpts({ namespace }),
    );
    return { workspace };
  },
});

function Page() {
  return <Outlet />;
}
