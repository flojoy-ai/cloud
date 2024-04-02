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
// import { Icons } from "@/components/icons";
import { Part } from "@cloud/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import CreatePart from "@/components/hardware/create-part";
import { DataTable } from "@/components/ui/data-table";
import { getPartsQueryOpts } from "@/lib/queries/part";
import { getProductsQueryOpts } from "@/lib/queries/product";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_protected/workspace/$namespace/part/")({
  component: HardwareInventory,

  pendingComponent: CenterLoadingSpinner,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(getPartsQueryOpts({ context }));
    context.queryClient.ensureQueryData(getProductsQueryOpts({ context }));
  },
});

type PartEntry = Part & { partVariationCount: number; hardwareCount: number };

const partColumns: ColumnDef<PartEntry>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "partVariationCount",
    header: "Variants",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.partVariationCount}</div>;
    },
  },
  {
    accessorKey: "hardwareCount",
    header: "Total number of units",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.hardwareCount}</div>;
    },
  },
  {
    id: "view-more",
    cell: ({ row }) => {
      return (
        <Link
          from={Route.fullPath}
          to={"$partId"}
          params={{ partId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];

function HardwareInventory() {
  const context = Route.useRouteContext();
  const { workspace } = context;

  const { data: parts } = useSuspenseQuery(getPartsQueryOpts({ context }));
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
              <Link from={WorkspaceIndexRoute.fullPath} to=".">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Inventory</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your registered parts.
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      <Separator />

      <div>
        <div className="py-2" />

        <h1 className="text-xl font-bold">Parts</h1>
        <div className="py-1" />
        <CreatePart workspaceId={workspace.id} products={products} />
        <div className="py-4" />

        {parts.length === 0 ? (
          <div className="text-muted-foreground">
            No parts found, go create one!
          </div>
        ) : (
          <DataTable columns={partColumns} data={parts} />
        )}
      </div>

      <div className="py-4" />
    </div>
  );
}
