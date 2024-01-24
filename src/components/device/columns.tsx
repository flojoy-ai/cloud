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
import { type SelectSystem, type SelectDevice } from "~/types/hardware";
import { toast } from "sonner";
import {
  type SelectSystemModel,
  type SelectDeviceModel,
  type SelectModel,
} from "~/types/model";
import { Badge } from "../ui/badge";
import _ from "lodash";

type ActionsProps = {
  elem: { id: string };
  children?: React.ReactNode;
};

const Actions = ({ elem, children }: ActionsProps) => {
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
            toast.promise(navigator.clipboard.writeText(elem.id), {
              success: "Copied to clipboard",
              error: "Something went wrong :(",
            })
          }
        >
          Copy ID
        </DropdownMenuItem>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const deviceColumns: ColumnDef<SelectDevice>[] = [
  {
    accessorKey: "name",
    header: "Device Name",
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      return <Badge>{row.original.model.name}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions elem={row.original} />,
  },
];

export const systemColumns: ColumnDef<SelectSystem>[] = [
  {
    accessorKey: "name",
    header: "System Name",
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      return <Badge>{row.original.model.name}</Badge>;
    },
  },
  {
    accessorKey: "parts",
    header: "Components",
    cell: ({ row }) => {
      const byModel = _.groupBy(row.original.parts, (p) => p.model.name);

      return (
        <div className="flex flex-col gap-2">
          {Object.entries(byModel).map(([modelName, devices]) => (
            <div>
              <Badge className="mb-1">{modelName}</Badge>
              {devices.map((d) => (
                <div key={d.id}>{d.name}</div>
              ))}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions elem={row.original} />,
  },
];

export const deviceModelColumns: ColumnDef<SelectDeviceModel>[] = [
  {
    accessorKey: "name",
    header: "Model Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions elem={row.original} />,
  },
];

export const systemModelColumns: ColumnDef<SelectSystemModel>[] = [
  {
    accessorKey: "name",
    header: "Model Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "parts",
    header: "Components",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-2">
          {row.original.parts.map((p) => (
            <div className="flex gap-2" key={p.name}>
              <Badge>{p.name}</Badge>
              <div className="font-medium">x{p.count}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions elem={row.original} />,
  },
];
