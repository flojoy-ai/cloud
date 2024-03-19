"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Workspace } from "~/schemas/public/Workspace";

type Props = {
  workspaces: Workspace[];
};

export const WorkspaceNav = ({ workspaces }: Props) => {
  const pathname = usePathname();
  const segments = pathname.split("/");

  const isWorkspaceRoute = segments[1] === "workspace";
  const namespace = segments[2];

  const currentWorkspace = workspaces.find((ws) => ws.namespace === namespace);

  return (
    <header className="sticky top-14 z-50 flex h-14 w-full items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {isWorkspaceRoute && currentWorkspace && (
        <div className="container flex max-w-screen-2xl gap-x-6">
          <Link
            href={`/workspace/${namespace}`}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === `/workspace/${namespace}`
                ? "text-foreground underline underline-offset-8"
                : "text-foreground/60",
            )}
          >
            Test Stations
          </Link>
          <Link
            href={`/workspace/${namespace}/hardware`}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === `/workspace/${namespace}/hardware`
                ? "text-foreground underline underline-offset-8"
                : "text-foreground/60",
            )}
          >
            Hardware Inventory
          </Link>

          <Link
            href={`/workspace/${namespace}/settings/general`}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname.startsWith(`/workspace/${namespace}/settings/`)
                ? "text-foreground underline underline-offset-8"
                : "text-foreground/60",
            )}
          >
            Settings
          </Link>
        </div>
      )}
    </header>
  );
};
