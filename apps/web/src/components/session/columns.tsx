import { Session } from "@cloud/shared";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    // TODO: Return aggregated result
  },
  {
    accessorKey: "aborted",
    header: "Aborted",
    cell: (row) => {
      if (row.row.original.aborted === true)
        return <Badge className="bg-red-300 text-red-900">Fail</Badge>;
      else return;
    },
  },
  {
    id: "integrity",
    header: "Integrity",
    cell: (row) => {
      if (row.row.original.integrity === true)
        return <Badge className="bg-green-300 text-green-900">Pass</Badge>;
      else row.row.original.integrity === false;
      return <Badge className="bg-red-300 text-red-900">Fail</Badge>;
    },
  },
  {
    accessorKey: "userId",
    header: "User",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          from={"/workspace/$namespace/station/$stationId"}
          to={"/workspace/$namespace/session/$sessionId"}
          params={{ sessionId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];
