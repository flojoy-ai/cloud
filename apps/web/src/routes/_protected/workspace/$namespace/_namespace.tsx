import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/_namespace",
)({
  component: Page,
  loader: async ({ params: { namespace } }) => {
    return await client.workspaces.id({ namespace }).get();
  },
});

import { Link } from "@tanstack/react-router";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/workspace/search-bar";
import { client } from "@/lib/client";

function Page() {
  const { namespace } = Route.useParams();
  const { data: workspaceId, error } = useLoaderData({
    from: "/_protected/workspace/$namespace/_namespace",
  });

  // TODO: Proper error handling
  if (error) {
    throw error;
  }

  return (
    <div className="container flex h-[calc(100vh-56px)] max-w-screen-2xl justify-center items-center">
      <div className="mb-48 flex w-[512px] flex-col items-center">
        <div className="mx-auto flex w-fit items-center space-x-3">
          <Icons.logo className="h-12 w-12" />
          <span className="text-3xl font-bold">{siteConfig.name}</span>
        </div>
        <div className="py-4" />
        <div className="flex gap-x-6">
          <Link
            href={`/workspace/${namespace}/project`}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Test Stations
          </Link>
          <Link
            href={`/workspace/${namespace}/hardware`}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Hardware Inventory
          </Link>

          <Link
            href={`/workspace/${namespace}/settings/general`}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Settings
          </Link>
        </div>
        <div className="py-2" />
        <div className="relative w-full">
          <div className="absolute w-full">
            <SearchBar workspaceId={workspaceId} namespace={namespace} />
          </div>
        </div>
      </div>

      <div className="py-8" />
    </div>
  );
}
