import { Session } from "@cloud/shared";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<
  Session & { status: boolean | null; userEmail: string }
>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    header: "Status",
    cell: ({ row }) => {
      if (row.original.status === true) {
        return <Badge variant={"green"}>Pass</Badge>;
      } else if (row.original.status === false) {
        return <Badge variant={"red"}>Fail</Badge>;
      } else {
        return <Badge variant={"gray"}>Unevaluated</Badge>;
      }
    },
  },
  {
    accessorKey: "aborted",
    header: "Aborted",
    cell: (row) => {
      if (row.row.original.aborted === true)
        return <Badge variant="red">Fail</Badge>;
      else return;
    },
  },
  {
    id: "integrity",
    header: "Integrity",
    cell: (row) => {
      if (row.row.original.integrity === true)
        return <Badge variant="green">Pass</Badge>;
      else row.row.original.integrity === false;
      return <Badge variant="red">Fail</Badge>;
    },
  },
  {
    accessorKey: "userEmail",
    header: "Operator",
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
