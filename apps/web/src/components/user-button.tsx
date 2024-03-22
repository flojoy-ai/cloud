import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { User } from "lucia";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { client } from "@/lib/client";

// TODO: Fix user type here
type Props = {
  user: User;
};

function UserButton({ user }: Props) {
  const router = useRouter();
  const logout = useMutation({
    mutationFn: async () => {
      await client.auth.logout.get();
    },
    onSuccess: () => {
      router.invalidate();
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 justify-start gap-2 rounded-[0.5rem] bg-background text-sm font-normal shadow-none",
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => router.navigate({ to: "/profile" })}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async () => {
            logout.mutate();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
