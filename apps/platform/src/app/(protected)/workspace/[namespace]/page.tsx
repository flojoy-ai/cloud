import { Input } from "@cloud/ui/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Icons } from "~/components/icons";
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";

export default async function Page({
  params,
}: {
  params: { namespace: string };
}) {
  const namespace = params.namespace;

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
        {/*TODO: Implement this search bar*/}
        <div className="relative w-full">
          <Search
            className="absolute left-2.5 top-2.5 stroke-muted-foreground"
            size={20}
          />
          <Input placeholder="Search..." className="ps-10" />
        </div>
      </div>

      <div className="py-8" />
    </div>
  );
}
