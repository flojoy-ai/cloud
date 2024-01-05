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
import NewWorkspace from "~/app/(protected)/dashboard/_components/new-workspace";

type Props = {
  workspaces: SelectWorkspace[];
  workspaceId: string;
};

export function ProtectedNav({ workspaces, workspaceId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false);

  const currentWorkspace = workspaces.find((ws) => ws.id === workspaceId);

  if (!currentWorkspace) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>

      <nav className="flex items-center gap-6 text-sm">
        <NewWorkspace
          isDialogOpen={showNewWorkspaceDialog}
          setIsDialogOpen={setShowNewWorkspaceDialog}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a workspace"
              className={cn("justify-between gap-2")}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${currentWorkspace.name}.png`}
                  alt={currentWorkspace.name}
                  className="grayscale"
                />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              {currentWorkspace.name}
              <Badge>{currentWorkspace.planType}</Badge>
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
                    key={workspace.name}
                    onSelect={() => {
                      router.push(`/workspace/${workspace.id}`);
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
                    {workspace.name}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentWorkspace.id === workspace.id
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
                      setShowNewWorkspaceDialog(true);
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

        <Link
          href={`/workspace/${workspaceId}`}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === `/workspace/${workspaceId}`
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Projects
        </Link>
        <Link
          href={`/workspace/${workspaceId}/device`}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === `/workspace/${workspaceId}/device`
              ? "text-foreground"
              : "text-foreground/60",
          )}
        >
          Device Inventory
        </Link>
      </nav>
    </div>
  );
}
