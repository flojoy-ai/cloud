"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectMeasurement } from "~/types/measurement";
import { type SelectTest } from "~/types/test";
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
import { type SelectHardware } from "~/types/hardware";

export const columns: ColumnDef<
  SelectMeasurement & { test: SelectTest; hardware: SelectHardware }
>[] = [
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
    accessorKey: "testId",
    header: "Test",
    accessorFn: (data) => data.test.name,
  },
  {
    accessorKey: "measurementType",
    header: "Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "data",
    header: "Data",
    // TODO: implement a better looking preview here
    accessorFn: (data) => {
      if (data.data.type === "boolean") {
        return data.data.passed ? "Passed" : "Failed";
      }

      return JSON.stringify(data.data).slice(0, 10);
    },
    cell: ({ row }) => {
      switch (row.original.data.type) {
        case "boolean":
          if (row.getValue("data") === "Passed") {
            return <div className="text-green-500">{row.getValue("data")}</div>;
          } else if (row.getValue("data") === "Failed") {
            return <div className="text-red-500">{row.getValue("data")}</div>;
          }
      }
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
              onClick={() => navigator.clipboard.writeText(measurement.id)}
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
                  hardwareId: measurement.hardware.id,
                  testId: measurement.test.id,
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
