import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Separator } from "@/components/ui/separator";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Icons } from "@/components/icons";
import { Family } from "@cloud/server/src/schemas/public/Family";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import CreateFamily from "@/components/hardware/create-family";
import { DataTable } from "@/components/ui/data-table";
import { getFamiliesOpts } from "@/lib/queries/family";
import { getProductsQueryOpts } from "@/lib/queries/product";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/",
)({
  component: HardwareInventory,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(getFamiliesOpts({ context }));
    context.queryClient.ensureQueryData(getProductsQueryOpts({ context }));
  },
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
  const context = Route.useRouteContext();
  const { workspace } = context;

  const { namespace } = Route.useParams();

  const router = useRouter();

  const { data: families } = useSuspenseQuery(getFamiliesOpts({ context }));
  const { data: products } = useSuspenseQuery(
    getProductsQueryOpts({ context }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace"
                params={{ namespace: workspace.namespace }}
              >
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Hardware Inventory</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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

        <h1 className="text-xl font-bold">Part Families</h1>
        <div className="py-1" />
        <CreateFamily workspaceId={workspace.id} products={products} />
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
