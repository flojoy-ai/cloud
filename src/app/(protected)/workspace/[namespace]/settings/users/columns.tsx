"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectUser } from "~/types/user";
import { type SelectWorkspace } from "~/types/workspace";
import { type SelectWorkspaceUser } from "~/types/workspace_user";

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
];
