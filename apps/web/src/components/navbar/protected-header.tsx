import { ModeToggle } from "@/components/navbar/mode-toggle";
import { Button } from "@/components/ui/button";

import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Workspace, WorkspaceUser } from "@cloud/shared";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { CheckIcon, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import UserButton from "./user-button";
import AuthButtons from "./auth-buttons";
import SearchBar from "../workspace/search-bar";

type NavProps = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | undefined;
};

export function ProtectedNav({ workspaces, currentWorkspace }: NavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/workspace" className="mr-6 flex items-center space-x-2">
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
              className={cn("justify-between gap-2 w-64")}
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
                      router.navigate({
                        to: `/workspace/$namespace`,
                        params: { namespace: workspace.namespace },
                      });
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
                      router.navigate({ to: "/setup" });
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
      </nav>
    </div>
  );
}

type Props = {
  workspaces: Workspace[];
  workspaceUser?: WorkspaceUser;
};

export function ProtectedHeader({ workspaces, workspaceUser }: Props) {
  const { user } = useAuth();

  const pathname = useRouterState().location.pathname;
  const segments = pathname.split("/");

  const namespace = segments[2];
  const isWorkspaceIndexRoute = !segments[3];

  const currentWorkspace = workspaces.find((ws) => ws.namespace === namespace);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <ProtectedNav
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
        />
        <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {currentWorkspace && !isWorkspaceIndexRoute && (
            <SearchBar
              workspace={currentWorkspace}
              className="max-w-72 w-full"
              small={true}
            />
          )}

          {!user ? (
            <AuthButtons />
          ) : (
            <UserButton user={user} workspaceUser={workspaceUser} />
          )}

          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
