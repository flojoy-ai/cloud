"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectMeasurement } from "~/types/measurement";

export const columns: ColumnDef<SelectMeasurement>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "deviceId",
    header: "Device",
  },
  {
    accessorKey: "testId",
    header: "Test",
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
    accessorFn: (data) => JSON.stringify(data.data).slice(0, 10),
  },
];
