import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { User } from "lucia";
import { useRouter } from "@tanstack/react-router";
import { env } from "@/env";
import { siteConfig } from "@/config/site";
import { Icons } from "../icons";
import { BookText } from "lucide-react";
import { WorkspaceUser } from "@cloud/shared";
import { Badge } from "../ui/badge";

// TODO: Fix user type here
type Props = {
  user: User;
  workspaceUser?: WorkspaceUser;
};

function UserButton({ user, workspaceUser }: Props) {
  const router = useRouter();

  async function handleLogout() {
    router.invalidate();
    window.location.href = env.VITE_SERVER_URL + "/auth/logout";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start gap-2 rounded-[0.5rem] bg-background text-sm font-normal shadow-none",
          )}
        >
          <Avatar className="h-5 w-5">
            <AvatarImage
              src={`https://avatar.vercel.sh/${user.email}.png`}
              alt={user.email}
              className="grayscale"
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div>{user.email}</div>
          {workspaceUser && <Badge>{workspaceUser?.role}</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem */}
        {/*   className="cursor-pointer" */}
        {/*   onSelect={() => router.navigate({ to: "/profile" })} */}
        {/* > */}
        {/*   Profile */}
        {/* </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <a href={"https://rest.flojoy.ai"} target="_blank">
            API Docs
          </a>
          <DropdownMenuShortcut>
            <BookText className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <a href={siteConfig.links.discord} target="_blank" rel="noreferrer">
            Support
          </a>
          <DropdownMenuShortcut>
            <Icons.discord className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <DropdownMenuShortcut>
            <Icons.github className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
