import { createFileRoute } from "@tanstack/react-router";

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/workspace/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_protected/workspace/$namespace/")({
  component: Page,
});

function Page() {
  const { workspace } = Route.useRouteContext();

  return (
    <div className="container max-w-screen-2xl w-full justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="py-8"></div>

        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://avatar.vercel.sh/${workspace.name}.png`}
              alt={workspace.name}
              className="grayscale"
            />
            <AvatarFallback>FJ</AvatarFallback>
          </Avatar>
          <span className="text-3xl font-bold">{workspace.name}</span>
        </div>

        <div className="py-4" />
        <div className="flex gap-x-6">
          <Link
            from={Route.fullPath}
            to="project"
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Test Profiles
          </Link>
          <Link
            from={Route.fullPath}
            to="part"
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Inventory
          </Link>
          <Link
            from={Route.fullPath}
            to="dashboard"
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Dashboard
          </Link>

          <Link
            from={Route.fullPath}
            to="settings"
            search={{ tab: "general" }}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Settings
          </Link>
        </div>

        <div className="py-2" />

        <div className="w-[512px]">
          <SearchBar workspace={workspace} emptyClassName="shadow-md" />
        </div>
      </div>

      <div className="py-8" />
    </div>
  );
}
