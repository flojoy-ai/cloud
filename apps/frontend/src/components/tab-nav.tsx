"use client";

import { Tabs, TabsList } from "@cloud/ui/components/ui/tabs";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

interface TabNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function TabNav({ className, items, ...props }: TabNavProps) {
  const pathname = usePathname();
  if (!items?.[0]) return null;

  return (
    <Tabs {...props} defaultValue={items[0].title} className={className}>
      <TabsList className="grid w-full grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.title}
            {...props}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            )}
            data-state={pathname.startsWith(item.href) ? "active" : "inactive"}
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}
