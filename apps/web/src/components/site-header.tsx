import { Link } from "@tanstack/react-router";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
// import { validateRequest } from "~/auth/lucia";
// import UserButton from "./user-button";

export function SiteHeader() {
  // const { user } = await validateRequest();

  // TODO: Auth
  const user = undefined;
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <nav className="flex flex-1 items-center justify-end gap-1">
          {!user ? (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link to={siteConfig.links.login}>Log In</Link>
              </Button>

              <Button size="sm" asChild>
                <Link to={siteConfig.links.signup}>Sign Up</Link>
              </Button>
            </>
          ) : (
            <>{/* <UserButton user={user} /> */}</>
          )}

          <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <div
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Icons.github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </div>
          </a>
          <a href={siteConfig.links.discord} target="_blank" rel="noreferrer">
            <div
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Icons.discord className="h-4 w-4" />
              <span className="sr-only">Discord</span>
            </div>
          </a>

          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
