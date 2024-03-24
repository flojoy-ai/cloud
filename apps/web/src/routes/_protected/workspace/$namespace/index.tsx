import { createFileRoute } from "@tanstack/react-router";

import { Link } from "@tanstack/react-router";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/workspace/search-bar";

export const Route = createFileRoute("/_protected/workspace/$namespace/")({
  component: Page,
});

function Page() {
  const { namespace } = Route.useParams();
  const { workspaceId } = Route.useRouteContext();

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
            to={`/workspace/$namespace/project`}
            params={{ namespace }}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Projects
          </Link>
          <Link
            to={`/workspace/$namespace/hardware`}
            params={{ namespace }}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Hardware Inventory
          </Link>

          <Link
            to={`/workspace/$namespace/settings`}
            params={{ namespace }}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Workspace Settings
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

