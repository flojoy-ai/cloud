import { createFileRoute, useRouter } from "@tanstack/react-router";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Icons } from "@/components/icons";
import { Family } from "@cloud/server/src/schemas/public/Family";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import CreateFamily from "@/components/hardware/create-family";
import { DataTable } from "@/components/ui/data-table";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/",
)({
  component: HardwareInventory,
  pendingComponent: () => (
    <div>
      <Icons.spinner className="mx-auto animate-spin" />
    </div>
  ),
});

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

function HardwareInventory() {
  const { workspaceId } = Route.useRouteContext();
  const { namespace } = Route.useParams();

  const router = useRouter();

  const { data: families } = useSuspenseQuery({
    queryFn: async () => {
      const { data, error } = await client.family.index.get({
        query: { workspaceId },
      });
      if (error) throw error;
      return data;
    },
    queryKey: ["family"],
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading>Hardware Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your registered devices and systems in this
          workspace. <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      <Separator />

      <div>
        <div className="py-2" />

        <h1 className="text-xl font-bold">Part families</h1>
        <div className="py-1" />
        <CreateFamily workspaceId={workspaceId} />
        <div className="py-4" />

        <DataTable
          columns={familyColumns}
          data={families}
          onRowClick={(row) => {
            console.log(row);
            router.navigate({
              to: "/workspace/$namespace/hardware/$familyId/",
              params: { namespace, familyId: row.id },
            });
          }}
        />
      </div>

      <div className="py-4" />
    </div>
  );
}
