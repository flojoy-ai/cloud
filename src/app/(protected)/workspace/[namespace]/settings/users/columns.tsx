"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectUser } from "~/types/user";
import { type SelectWorkspace } from "~/types/workspace";
import { type SelectWorkspaceUser } from "~/types/workspace_user";
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

export const userColumns: ColumnDef<{
  user: SelectUser;
  workspace: SelectWorkspace;
  workspace_user: SelectWorkspaceUser;
}>[] = [
  {
    accessorKey: "user",
    header: "Email",
    cell: ({ row }) => {
      return <div>{row.original.user.email}</div>;
    },
  },

  {
    accessorKey: "workspace_user",
    header: "Role",
    cell: ({ row }) => {
      return <div>{row.original.workspace_user.workspaceRole}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
                toast.promise(
                  navigator.clipboard.writeText(row.original.user.email),
                  {
                    success: "Copied to clipboard",
                    error: "Something went wrong :(",
                  },
                )
              }
            >
              Copy email
            </DropdownMenuItem>
            {row.original.workspace_user.workspaceRole !== "owner" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Update role</DropdownMenuItem>
                <DropdownMenuItem>Remove user</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];