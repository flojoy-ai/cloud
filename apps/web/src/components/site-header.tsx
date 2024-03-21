import { Link } from "@tanstack/react-router";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
// import { validateRequest } from "~/auth/lucia";
// import UserButton from "./user-button";
import { type Route } from "next";

export function SiteHeader() {
  // const { user } = await validateRequest();

  // TODO: Auth
  const user = undefined;
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {!user ? (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link to={siteConfig.links.login as Route}>Log In</Link>
                </Button>

                <div className="px-1" />

                <Button size="sm" asChild>
                  <Link to={siteConfig.links.signup as Route}>Sign Up</Link>
                </Button>

                <div className="px-1" />
              </>
            ) : (
              <>
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
