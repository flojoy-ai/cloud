"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/dashboard")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>

        <Link
          href="/explorer"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/explorer")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Explorer
        </Link>

        <Link
          href="/pricing"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/pricing")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Pricing
        </Link>

        <Link
          href="https://www.flojoy.ai/contact-sales"
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
          )}
        >
          Contact Sales
        </Link>
      </nav>
    </div>
  );
}
