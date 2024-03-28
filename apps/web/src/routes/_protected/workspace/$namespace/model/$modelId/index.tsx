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
import { ModelTreeVisualization } from "@/components/visualization/tree-visualization";
import { getFamilyQueryOpts } from "@/lib/queries/family";
import { getModelHardwareQueryOpts } from "@/lib/queries/hardware";
import { HardwareWithParent } from "@cloud/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/model/$modelId/",
)({
  component: ModelPage,
  loader: ({ context, params: { modelId } }) => {
    context.queryClient.ensureQueryData(
      getModelHardwareQueryOpts({ modelId, context }),
    );
    context.queryClient.ensureQueryData(
      getFamilyQueryOpts({ familyId: context.model.familyId, context }),
    );
  },
});

const hardwareColumns: ColumnDef<HardwareWithParent>[] = [
  {
    accessorKey: "name",
    header: "Instance SN",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => {
      const parentName = row.original.parent?.name;
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

function ModelPage() {
  const { workspace, model } = Route.useRouteContext();
  const { modelId } = Route.useParams();
  const router = useRouter();

  const { data: hardware } = useSuspenseQuery(
    getModelHardwareQueryOpts({ modelId, context: { workspace } }),
  );

  const { data: family } = useSuspenseQuery(
    getFamilyQueryOpts({
      familyId: model.familyId,
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
              <Link from={WorkspaceIndexRoute.fullPath} to="family">
                Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="family/$familyId"
                params={{ familyId: family.id }}
              >
                {family.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{model.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>{model.name}</PageHeaderHeading>
        <div className="text-muted-foreground font-bold">
          Product: {family.productName}
        </div>
        <PageHeaderDescription>
          Here you can find all of the parts registered under this family.
          <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />
      <CreateHardware workspace={workspace} modelId={model.id}>
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
              No hardware found for this model, go register one!
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
          <ModelTreeVisualization tree={model} />
        </div>
      </div>
      <div className="py-4" />
    </div>
  );
}
