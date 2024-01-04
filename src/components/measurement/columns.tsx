"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectDevice } from "~/types/device";
import { type SelectMeasurement } from "~/types/measurement";
import { type SelectTest } from "~/types/test";

export const columns: ColumnDef<
  SelectMeasurement & { test: SelectTest; device: SelectDevice }
>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "deviceId",
    header: "Device",
    accessorFn: (data) => data.device.name,
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
    accessorFn: (data) => JSON.stringify(data.data).slice(0, 10),
  },
];
