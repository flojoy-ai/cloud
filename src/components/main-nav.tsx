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
            "hover:text-foreground/80 transition-colors",
            pathname?.startsWith("/dashboard")
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
      </nav>
    </div>
  );
}
