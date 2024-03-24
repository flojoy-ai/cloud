import { ModeToggle } from "@/components/mode-toggle";
import { Button, buttonVariants } from "@/components/ui/button";

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
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type NavProps = {
  workspaces: Workspace[];
};

export function ProtectedNav({ workspaces }: NavProps) {
  const router = useRouter();
  const pathname = useRouterState().location.pathname;
  const [open, setOpen] = useState(false);
  const segments = pathname.split("/");

  const namespace = segments[2];

  const currentWorkspace = workspaces.find((ws) => ws.namespace === namespace);

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/" className="mr-6 flex items-center space-x-2">
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

type Props = {
  workspaces: Workspace[];
};

export function ProtectedHeader({ workspaces }: Props) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <ProtectedNav workspaces={workspaces} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {!user ? (
              <>
                <Button size="sm" variant="outline" asChild>
                  <a href={siteConfig.links.login}>Log In</a>
                </Button>

                <div className="px-1" />

                <Button size="sm" asChild>
                  <a href={siteConfig.links.signup}>Sign Up</a>
                </Button>

                <div className="px-1" />
              </>
            ) : (
              <>
                {/*TODO: Add this back*/}
                {/* {invites.length > 0 && ( */}
                {/*   <Button */}
                {/*     className="h-8 rounded-[0.5rem] text-sm font-normal shadow-none" */}
                {/*     asChild */}
                {/*   > */}
                {/*     <Link href="/workspace/invites"> */}
                {/*       {invites.length} pending invite{invites.length > 1 && "s"} */}
                {/*     </Link> */}
                {/*   </Button> */}
                {/* )} */}
                {/* <div className="px-1" /> */}
                {/**/}
                {/* <UserButton user={user} /> */}
                {/* <div className="px-1" /> */}
              </>
            )}

            <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
              <div
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
              >
                <Icons.github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </a>
            <a href={siteConfig.links.discord} target="_blank" rel="noreferrer">
              <div
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
              >
                <Icons.discord className="h-4 w-4" />
                <span className="sr-only">Discord</span>
              </div>
            </a>

            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
