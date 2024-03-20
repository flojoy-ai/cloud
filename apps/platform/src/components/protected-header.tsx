import Link from "next/link";

import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";
import { ModeToggle } from "~/components/mode-toggle";
import { Button, buttonVariants } from "@cloud/ui/components/ui/button";
import { validateRequest } from "~/auth/lucia";
import { ProtectedNav } from "./protected-nav";
import { api } from "~/trpc/server";
import UserButton from "./user-button";
import { type Route } from "next";

export async function ProtectedHeader() {
  const { user } = await validateRequest();

  const [workspaces, invites] = await Promise.all([
    api.workspace.getWorkspaces(),
    api.user.getAllWorkspaceInvites(),
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <ProtectedNav workspaces={workspaces} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {!user ? (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link href={siteConfig.links.login as Route}>Log In</Link>
                </Button>

                <div className="px-1" />

                <Button size="sm" asChild>
                  <Link href={siteConfig.links.signup as Route}>Sign Up</Link>
                </Button>

                <div className="px-1" />
              </>
            ) : (
              <>
                {invites.length > 0 && (
                  <Button
                    className="h-8 rounded-[0.5rem] text-sm font-normal shadow-none"
                    asChild
                  >
                    <Link href="/workspace/invites">
                      {invites.length} pending invite{invites.length > 1 && "s"}
                    </Link>
                  </Button>
                )}
                <div className="px-1" />

                <UserButton user={user} />
                <div className="px-1" />
              </>
            )}

            <Link
              href={siteConfig.links.discord as Route}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-9 px-0",
                )}
              >
                <Icons.discord className="h-4 w-4" />
                <span className="sr-only">Discord</span>
              </div>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
