"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CheckIcon, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
import { type SelectWorkspace } from "~/types/workspace";
import { useState } from "react";
import { Badge } from "./ui/badge";

type Props = {
  workspaces: SelectWorkspace[];
};

export function ProtectedNav({ workspaces }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const namespace = pathname.split("/")[1];

  const currentWorkspace = workspaces.find((ws) => ws.namespace === namespace);

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>

      <nav className="flex items-center gap-6 text-sm">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a workspace"
              className={cn("justify-between gap-2")}
            >
              {currentWorkspace ? (
                <>
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${currentWorkspace.name}.png`}
                      alt={currentWorkspace.name}
                      className="grayscale"
                    />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="max-w-32 overflow-hidden text-ellipsis">
                    {currentWorkspace.name}
                  </div>
                  <Badge>{currentWorkspace.planType}</Badge>
                </>
              ) : (
                <div>Select a workspace</div>
              )}
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command>
              <CommandList>
                <CommandInput placeholder="Search workspace..." />
                <CommandEmpty>No team found.</CommandEmpty>
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.namespace}
                    onSelect={() => {
                      router.push(`/${workspace.namespace}`);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${workspace.name}.png`}
                        alt={workspace.name}
                        className="grayscale"
                      />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    {workspace.name} ({workspace.namespace})
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentWorkspace?.id === workspace.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandList>
              <CommandSeparator />
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      router.push("/setup");
                    }}
                  >
                    <PlusCircleIcon className="mr-2 h-5 w-5" />
                    Create Workspace
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {currentWorkspace && (
          <>
            <Link
              href={`/${namespace}`}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === `/${namespace}`
                  ? "text-foreground"
                  : "text-foreground/60",
              )}
            >
              Projects
            </Link>
            <Link
              href={`/${namespace}/device`}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === `/${namespace}/device`
                  ? "text-foreground"
                  : "text-foreground/60",
              )}
            >
              Device Inventory
            </Link>
          </>
        )}

        <Link
          href={"https://rest.flojoy.ai"}
          target="_blank"
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
          )}
        >
          API Docs
        </Link>
      </nav>
    </div>
  );
}
