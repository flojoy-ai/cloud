"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type SelectDevice } from "~/types/device";

export const columns: ColumnDef<SelectDevice>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  },
];
