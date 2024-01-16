"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { type SelectWorkspace } from "~/types/workspace";

type Props = {
  workspaces: SelectWorkspace[];
};

export const WorkspaceNav = ({ workspaces }: Props) => {
  const pathname = usePathname();
  const segments = pathname.split("/");

  const isWorkspaceRoute = segments[1] === "workspace";
  const namespace = segments[2];

  const currentWorkspace = workspaces.find((ws) => ws.namespace === namespace);

  return (
    <div className="border-b border-border/40 py-4 text-sm font-medium">
      {isWorkspaceRoute && currentWorkspace && (
        <div className="container flex max-w-screen-2xl gap-x-4">
          <Link
            href={`/workspace/${namespace}`}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === `/workspace/${namespace}`
                ? "text-foreground underline underline-offset-8"
                : "text-foreground/60",
            )}
          >
            Projects
          </Link>
          <Link
            href={`/workspace/${namespace}/device`}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === `/workspace/${namespace}/device`
                ? "text-foreground underline underline-offset-8"
                : "text-foreground/60",
            )}
          >
            Device Inventory
          </Link>
        </div>
      )}
    </div>
  );
};
