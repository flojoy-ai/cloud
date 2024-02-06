"use client";

import { Row, type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { User } from "~/schemas/public/User";
import { WorkspaceUser } from "~/schemas/public/WorkspaceUser";

type Data = User & Pick<WorkspaceUser, "role">;

const UserAction = ({ row }: { row: Row<Data> }) => {
  const router = useRouter();
  const remove = api.user.removeUserFromWorkspace.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            toast.promise(navigator.clipboard.writeText(row.original.email), {
              success: "Copied to clipboard",
              error: "Something went wrong :(",
            })
          }
        >
          Copy email
        </DropdownMenuItem>
        {row.original.role !== "owner" && (
          <>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>Update role</DropdownMenuItem> */}
            <DropdownMenuItem
              onSelect={() => {
                toast.promise(
                  remove.mutateAsync({
                    userId: row.original.id,
                  }),
                  {
                    success: "User removed.",
                    loading: "Removing user...",
                    error: "Something went wrong :(",
                  },
                );
              }}
            >
              Remove user
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const userColumns: ColumnDef<Data>[] = [
  {
    accessorKey: "user",
    header: "Email",
    cell: ({ row }) => {
      return <div>{row.original.email}</div>;
    },
  },

  {
    accessorKey: "workspace_user",
    header: "Role",
    cell: ({ row }) => {
      return <div>{row.original.role}</div>;
    },
  },
  {
    id: "actions",
    cell: UserAction,
  },
];
