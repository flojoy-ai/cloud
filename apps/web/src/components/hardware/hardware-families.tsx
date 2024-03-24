import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Family } from "@cloud/server/src/schemas/public/Family";
import { useRouter } from "@tanstack/react-router";
import CreateFamily from "./create-family";

const familyColumns: ColumnDef<Family>[] = [
  {
    accessorKey: "name",
    header: "PIN",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
];

type Props = {
  workspaceId: string;
  namespace: string;
  families: Family[];
};

export default function HardwareFamilies({ workspaceId, families }: Props) {
  const router = useRouter();

  return (
    <div>
      <div className="py-2" />

      <h1 className="text-xl font-bold">Hardware Models</h1>
      <div className="py-1" />
      <CreateFamily workspaceId={workspaceId} />
      <div className="py-4" />

      <DataTable
        columns={familyColumns}
        data={families}
        onRowClick={(row) =>
          // TODO: Navigate
          undefined
        }
      />
    </div>
  );
}
