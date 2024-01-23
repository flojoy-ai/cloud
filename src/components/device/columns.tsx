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
import { Badge } from "../ui/badge";

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
    header: "Model Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "type",
    header: "Model Type",
  },
  {
    accessorKey: "parts",
    header: "Components",
    cell: ({ row }) => {
      if (row.original.type === "device") {
        return "N/A";
      }

      return (
        <div className="flex flex-col gap-2">
          {row.original.parts.map((p) => (
            <div className="flex gap-2" key={p.name}>
              <Badge>{p.name}</Badge>
              <div>x{p.count}</div>
            </div>
          ))}
        </div>
      );
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
              Copy model ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
