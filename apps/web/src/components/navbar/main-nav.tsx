import { Link } from "@tanstack/react-router";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useRouterState } from "@tanstack/react-router";

export function MainNav() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          to="/workspace"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/workspace"
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>

        <a
          href="https://www.flojoy.ai/contact-sales"
          target="_blank"
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
          )}
        >
          Contact Sales
        </a>

        <a
          href={"https://rest.flojoy.ai"}
          target="_blank"
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
          )}
        >
          API Docs
        </a>
      </nav>
    </div>
  );
}
