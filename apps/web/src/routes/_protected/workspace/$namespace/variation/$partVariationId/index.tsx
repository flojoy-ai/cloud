import CreateHardware from "@/components/hardware/create-hardware";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PartVariationTreeVisualization } from "@/components/visualization/tree-visualization";
import { getPartQueryOpts } from "@/lib/queries/part";
import { getPartVariationHardwareQueryOpts } from "@/lib/queries/hardware";
import { HardwareWithParent } from "@cloud/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/variation/$partVariationId/",
)({
  component: PartVariationPage,
  loader: ({ context, params: { partVariationId } }) => {
    context.queryClient.ensureQueryData(
      getPartVariationHardwareQueryOpts({ partVariationId, context }),
    );
    context.queryClient.ensureQueryData(
      getPartQueryOpts({ partId: context.partVariation.partId, context }),
    );
  },
});

const hardwareColumns: ColumnDef<HardwareWithParent>[] = [
  {
    accessorKey: "name",
    header: "Serial Number",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.serialNumber}</Badge>;
    },
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => {
      const parentName = row.original.parent?.serialNumber;
      if (!parentName) return null;
      return <Badge variant="outline">{parentName}</Badge>;
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: HardwareActions,
  // },
];

function PartVariationPage() {
  const { workspace, partVariation } = Route.useRouteContext();
  const { partVariationId } = Route.useParams();
  const router = useRouter();

  const { data: hardware } = useSuspenseQuery(
    getPartVariationHardwareQueryOpts({
      partVariationId,
      context: { workspace },
    }),
  );

  const { data: part } = useSuspenseQuery(
    getPartQueryOpts({
      partId: partVariation.partId,
      context: { workspace },
    }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.to} to=".">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.fullPath} to="part">
                Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="part/$partId"
                params={{ partId: part.id }}
              >
                {part.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{partVariation.partNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>{partVariation.partNumber}</PageHeaderHeading>
        <div className="text-muted-foreground font-bold">
          Product: {part.productName}
        </div>
        <PageHeaderDescription>
          Here you can find all of the parts registered under this part.
          <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />
      <CreateHardware workspace={workspace} partVariationId={partVariation.id}>
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateHardware>
      <div className="py-2" />
      <h1 className="text-xl font-bold">Instances</h1>
      <div className="py-2" />
      <div className="flex gap-x-8">
        <div className="w-3/5">
          {hardware.length === 0 ? (
            <div className="text-muted-foreground">
              No hardware found for this partVariation, go register one!
            </div>
          ) : (
            <ScrollArea className="h-[379px]">
              <DataTable
                columns={hardwareColumns}
                data={hardware}
                onRowClick={(row) =>
                  router.navigate({
                    from: WorkspaceIndexRoute.fullPath,
                    to: "hardware/$hardwareId",
                    params: { hardwareId: row.id },
                  })
                }
              />
            </ScrollArea>
          )}
        </div>
        <div className="w-2/5 h-[379px] border rounded-lg">
          <PartVariationTreeVisualization tree={partVariation} />
        </div>
      </div>
      <div className="py-4" />
    </div>
  );
}
