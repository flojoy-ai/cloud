import Link from "next/link";
import { Icons } from "~/components/icons";
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import SearchBar from "./_components/search-bar";
import { api } from "~/trpc/server";

export default async function Page({
  params,
}: {
  params: { namespace: string };
}) {
  const namespace = params.namespace;
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace({
    namespace,
  });
  console.log(workspaceId);

  return (
    <div className="container flex h-[calc(100vh-56px)] max-w-screen-2xl items-center justify-center">
      <div className="mb-56 flex w-[512px] flex-col items-center">
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
            href={`/workspace/${namespace}/settings`}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground/80",
            )}
          >
            Settings
          </Link>
        </div>
        <div className="py-2" />
        <SearchBar workspaceId={workspaceId} namespace={namespace} />
      </div>

      <div className="py-8" />
    </div>
  );
}
