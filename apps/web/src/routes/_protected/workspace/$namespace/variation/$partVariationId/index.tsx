import CenterLoadingSpinner from "@/components/center-loading-spinner";
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
import CreateUnit from "@/components/unit/create-unit";
import { PartVariationTreeVisualization } from "@/components/visualization/tree-visualization";
import { useWorkspaceUser } from "@/hooks/use-workspace-user";
import { getPartQueryOpts } from "@/lib/queries/part";
import { getPartVariationUnitQueryOpts } from "@/lib/queries/unit";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import { UnitWithParent } from "@cloud/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Plus } from "lucide-react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/variation/$partVariationId/",
)({
  component: PartVariationPage,

  pendingComponent: CenterLoadingSpinner,
  loader: ({ context, params: { partVariationId } }) => {
    context.queryClient.ensureQueryData(
      getPartVariationUnitQueryOpts({ partVariationId, context }),
    );
    context.queryClient.ensureQueryData(
      getPartQueryOpts({ partId: context.partVariation.partId, context }),
    );
  },
});

const unitColumns: ColumnDef<UnitWithParent>[] = [
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
      if (!row.original.parent) return null;
      const parentName = row.original.parent?.serialNumber;
      return (
        <Link
          from={WorkspaceIndexRoute.fullPath}
          to="unit/$unitId"
          params={{ unitId: row.original.parent.id }}
        >
          <Badge variant="outline" className="hover:bg-muted">
            {parentName}
          </Badge>
        </Link>
      );
    },
  },
  {
    id: "view-more",
    cell: ({ row }) => {
      return (
        <Link
          from={"/workspace/$namespace/variation/$partVariationId"}
          to={"/workspace/$namespace/unit/$unitId"}
          params={{ unitId: row.original.id }}
        >
          <ArrowRight />
        </Link>
      );
    },
  },
];

function PartVariationPage() {
  const { workspace, partVariation } = Route.useRouteContext();
  const { partVariationId } = Route.useParams();
  const router = useRouter();

  const { data: unit } = useSuspenseQuery(
    getPartVariationUnitQueryOpts({
      partVariationId,
      context: { workspace },
    }),
  );

  const { workspaceUserPerm } = useWorkspaceUser();

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
          Here you can find all of the units of this part variation.
          <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />
      {workspaceUserPerm.canWrite() && (
        <>
          <CreateUnit workspace={workspace} partVariationId={partVariation.id}>
            <div className="flex items-center gap-1">
              <Plus size={20} />
              <div>Create</div>
            </div>
          </CreateUnit>
          <div className="py-2" />
        </>
      )}
      <h1 className="text-xl font-bold">Instances</h1>
      <div className="py-2" />
      <div className="flex gap-x-8">
        <div className="w-3/5">
          {unit.length === 0 ? (
            <div className="text-muted-foreground">
              No units found for this part variation, go register one!
            </div>
          ) : (
            <ScrollArea className="h-[379px]">
              <DataTable columns={unitColumns} data={unit} />
            </ScrollArea>
          )}
        </div>
        <div className="w-2/5 h-[379px] border rounded-lg">
          <PartVariationTreeVisualization
            tree={partVariation}
            onNodeClick={(node) => {
              router.navigate({
                from: WorkspaceIndexRoute.fullPath,
                to: "variation/$partVariationId",
                params: {
                  partVariationId: node.data.partVariation.id,
                },
              });
            }}
          />
        </div>
      </div>
      <div className="py-4" />
    </div>
  );
}
