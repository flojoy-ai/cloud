"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { type SelectHardware } from "~/types/hardware";
import { toast } from "sonner";
import { type SelectModel } from "~/types/model";

export const deviceColumns: ColumnDef<SelectHardware>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const [mounted, setMounted] = useState(false);
      useEffect(() => {
        setMounted(true);
      }, []);
      if (mounted) {
        return row.original.createdAt.toLocaleString();
      }
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const [mounted, setMounted] = useState(false);
      useEffect(() => {
        setMounted(true);
      }, []);
      if (mounted) {
        return row.original.updatedAt?.toLocaleString() ?? "Never";
      }
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const device = row.original;

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
                toast.promise(navigator.clipboard.writeText(device.id), {
                  success: "Copied to clipboard",
                  error: "Something went wrong :(",
                })
              }
            >
              Copy device ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const modelColumns: ColumnDef<SelectModel>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const [mounted, setMounted] = useState(false);
      useEffect(() => {
        setMounted(true);
      }, []);
      if (mounted) {
        return row.original.createdAt.toLocaleString();
      }
    },
  },
  {
    accessorKey: "parts",
    header: "Parts",
    cell: ({ row }) => {
      if (row.original.type === "device") {
        return undefined;
      }

      return row.original.parts.map((p) => `${p.name} x${p.count}`).join("\n");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const device = row.original;

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
                toast.promise(navigator.clipboard.writeText(device.id), {
                  success: "Copied to clipboard",
                  error: "Something went wrong :(",
                })
              }
            >
              Copy device ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
