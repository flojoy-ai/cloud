"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectMeasurement } from "~/types/measurement";
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
import { Badge, badgeVariants } from "../ui/badge";

export const columns: ColumnDef<SelectMeasurement>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "deviceId",
    header: "Device",
    accessorFn: (data) => data.hardware.name,
  },
  {
    accessorKey: "data.type",
    header: "Measurement Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "id",
    header: "Measurement ID",
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      return row.original.tags.map((t) => (
        <Badge
          key={row.original.id + t.name}
          className={badgeVariants({ variant: "secondary" })}
        >
          {t.name}
        </Badge>
      ));
    },
  },
  {
    accessorKey: "pass",
    header: "Pass",
    cell: ({ row }) => {
      const val = row.original.pass;
      return val === null ? (
        <div className="text-muted-foreground">Unevaluated</div>
      ) : val ? (
        <div className="text-green-500">Pass</div>
      ) : (
        <div className="text-red-500">Fail</div>
      );
    },
  },
  {
    accessorKey: "data",
    header: "Data",
    // TODO: implement a better looking preview here
    accessorFn: (data) => {
      return JSON.stringify(data.data.value).slice(0, 10);
    },
    cell: ({ row }) => {
      return <div>{row.getValue("data")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const measurement = row.original;
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
              onClick={async (e) => {
                e.stopPropagation();
                await navigator.clipboard.writeText(measurement.id);
              }}
            >
              Copy measurement ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Download</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                const json = {
                  id: measurement.id,
                  name: measurement.name,
                  data: measurement.data,
                  hardwareId: measurement.hardwareId,
                  testId: measurement.testId,
                  createdAt: measurement.createdAt,
                };
                const data = JSON.stringify(json);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = `${measurement.id}.json`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
