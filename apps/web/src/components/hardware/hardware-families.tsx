import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Family } from "@cloud/server/src/schemas/public/Family";
import { useRouter } from "@tanstack/react-router";
import CreateFamily from "./create-family";

type FamilyEntry = Family & { modelCount: number; hardwareCount: number };

const familyColumns: ColumnDef<FamilyEntry>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "modelCount",
    header: "Variants",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.modelCount}</div>;
    },
  },
  {
    accessorKey: "hardwareCount",
    header: "Total Parts",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.hardwareCount}</div>;
    },
  },
];

type Props = {
  workspaceId: string;
  namespace: string;
  families: FamilyEntry[];
};

export default function HardwareFamilies({ workspaceId, families }: Props) {
  const router = useRouter();

  return (
    <div>
      <div className="py-2" />

      <h1 className="text-xl font-bold">Part families</h1>
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
