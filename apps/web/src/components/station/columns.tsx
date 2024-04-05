import { Station } from "@cloud/shared";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Station>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          from={"/workspace/$namespace/project/"}
          to={"/workspace/$namespace/station/$stationId"}
          params={{ stationId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];
