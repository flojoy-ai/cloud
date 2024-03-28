import CreateModel from "@/components/hardware/create-model";
import { Icons } from "@/components/icons";
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
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/client";
import { getFamilyQueryOpts } from "@/lib/queries/family";
import { getFamilyModelsQueryOpts } from "@/lib/queries/model";
import { Model } from "@cloud/server/src/schemas/public/Model";
import { ModelTreeNode } from "@cloud/server/src/types/model";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import { ModelTreeVisualization } from "@/components/visualization/tree-visualization";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/family/$familyId/",
)({
  component: FamilyPage,
  loader: ({ context, params: { familyId } }) => {
    context.queryClient.ensureQueryData(
      getFamilyModelsQueryOpts({ familyId, context }),
    );
    context.queryClient.ensureQueryData(
      getFamilyQueryOpts({ familyId, context }),
    );
  },
});

const modelColumns: ColumnDef<Model & { hardwareCount: number }>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link
          from={WorkspaceIndexRoute.fullPath}
          to="model/$modelId"
          params={{ modelId: row.original.id }}
        >
          <Badge>{row.original.name}</Badge>
        </Link>
      );
    },
  },
  {
    accessorKey: "hardwareCount",
    header: "Number of units",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.hardwareCount}</div>
    },
  },
];

const modelComponentColumns: ColumnDef<ModelTreeNode & { count: number }>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "count",
    header: "Count",
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.count}</div>;
    },
  },
];

function FamilyPage() {
  const { workspace } = Route.useRouteContext();
  const { familyId } = Route.useParams();

  const { data: models } = useSuspenseQuery(
    getFamilyModelsQueryOpts({ familyId, context: { workspace } }),
  );

  const { data: family } = useSuspenseQuery(
    getFamilyQueryOpts({ familyId, context: { workspace } }),
  );

  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    models[0]?.id,
  );

  const { data: modelTree, isPending } = useQuery({
    queryFn: async () => {
      if (!selectedModelId) return undefined;
      const { data, error } = await client
        .model({ modelId: selectedModelId })
        .index.get({
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) throw error;
      return data;
    },
    queryKey: ["modelTree", selectedModelId],
    enabled: selectedModelId !== undefined,
  });

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
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="family"
                params={{ namespace: workspace.namespace }}
              >
                Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{family.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>{family.name}</PageHeaderHeading>
        <div className="text-muted-foreground font-bold">
          Product: {family.productName}
        </div>
        <PageHeaderDescription>
          Here you can find all of the parts registered under this family.
          <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />
      <Separator />
      <div className="py-2" />
      <CreateModel workspaceId={workspace.id} models={models} family={family} />
      <div className="py-2" />
      <h1 className="text-xl font-bold">Part Variations</h1>
      <div className="py-2" />

      {models.length === 0 ? (
        <div className="text-muted-foreground">
          No models found, go create one!
        </div>
      ) : (
        <>
          <DataTable
            columns={modelColumns}
            data={models}
            onRowClick={(row) => setSelectedModelId(row.id)}
            highlightRow={(row) => row.id === selectedModelId}
          />
          <div className="py-4" />
          {selectedModelId && isPending ? (
            <Icons.spinner className="mx-auto animate-spin" />
          ) : (
            modelTree && (
              <>
                <h1 className="text-xl font-bold">Sub-assemblies</h1>
                <div className="py-2" />
                <div className="flex">
                  <div className="w-3/5">
                    <DataTable
                      columns={modelComponentColumns}
                      data={modelTree.components.map((child) => ({
                        count: child.count,
                        ...child.model,
                      }))}
                      onRowClick={(row) => setSelectedModelId(row.id)}
                    />
                  </div>
                  <div className="w-2/5">
                    <ModelTreeVisualization tree={modelTree} />
                  </div>
                </div>
              </>
            )
          )}
        </>
      )}
      <div className="py-4" />
    </div>
  );
}
