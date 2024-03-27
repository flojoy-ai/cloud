import { Station } from "@cloud/server/src/schemas/public/Station";
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
          from={"/workspace/$namespace/project/$projectId"}
          to={"/workspace/$namespace/project/$projectId/station/$stationId"}
          params={{ stationId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];
