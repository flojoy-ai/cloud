import CreatePartVariation from "@/components/unit/create-part-variation";
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
import { getPartQueryOpts } from "@/lib/queries/part";
import {
  getPartPartVariationsQueryOpts,
  getPartVariationsQueryOpts,
} from "@/lib/queries/part-variation";
import { PartVariation, PartVariationTreeNode } from "@cloud/shared";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import { PartVariationTreeVisualization } from "@/components/visualization/tree-visualization";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/part/$partId/",
)({
  pendingComponent: CenterLoadingSpinner,
  component: PartVariationPage,
  loader: ({ context, params: { partId } }) => {
    context.queryClient.ensureQueryData(
      getPartPartVariationsQueryOpts({ partId, context }),
    );
    context.queryClient.ensureQueryData(
      getPartVariationsQueryOpts({ context }),
    );
    context.queryClient.ensureQueryData(getPartQueryOpts({ partId, context }));
  },
});

const partVariationColumns: ColumnDef<PartVariation & { unitCount: number }>[] =
  [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <Badge>{row.original.partNumber}</Badge>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "unitCount",
      header: "Number of units",
      cell: ({ row }) => {
        return <div className="font-bold">{row.original.unitCount}</div>;
      },
    },
    {
      id: "view-more",
      cell: ({ row }) => {
        return (
          <Link
            from={"/workspace/$namespace/part/$partId"}
            to={"/workspace/$namespace/variation/$partVariationId"}
            params={{ partVariationId: row.original.id }}
          >
            <ArrowRight />
          </Link>
        );
      },
    },
  ];

const partVariationComponentColumns: ColumnDef<
  PartVariationTreeNode & { count: number }
>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <Badge>{row.original.partNumber}</Badge>;
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

function PartVariationPage() {
  const { workspace } = Route.useRouteContext();
  const { partId } = Route.useParams();

  const router = useRouter();

  const { data: partVariations } = useSuspenseQuery(
    getPartPartVariationsQueryOpts({ partId, context: { workspace } }),
  );

  const { data: allPartVariations } = useSuspenseQuery(
    getPartVariationsQueryOpts({ context: { workspace } }),
  );

  const { data: part } = useSuspenseQuery(
    getPartQueryOpts({ partId, context: { workspace } }),
  );

  const [selectedPartVariationId, setSelectedPartVariationId] = useState<
    string | undefined
  >(partVariations[0]?.id);

  const { data: partVariationTree, isPending } = useQuery({
    queryFn: async () => {
      if (!selectedPartVariationId) return undefined;
      const { data, error } = await client
        .partVariation({ partVariationId: selectedPartVariationId })
        .index.get({
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) throw error;
      return data;
    },
    queryKey: ["partVariationTree", selectedPartVariationId],
    enabled: selectedPartVariationId !== undefined,
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
                to="part"
                params={{ namespace: workspace.namespace }}
              >
                Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{part.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading>{part.name}</PageHeaderHeading>
        <div className="text-muted-foreground font-bold">
          Product: {part.productName}
        </div>
        <PageHeaderDescription>
          Here you can find all of this part's variations.
          <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />
      <Separator />
      <div className="py-2" />
      <CreatePartVariation
        workspaceId={workspace.id}
        partVariations={allPartVariations}
        part={part}
      />
      <div className="py-2" />
      <h1 className="text-xl font-bold">Variations</h1>
      <div className="py-2" />

      {partVariations.length === 0 ? (
        <div className="text-muted-foreground">
          No part variations found, go create one!
        </div>
      ) : (
        <>
          <DataTable
            columns={partVariationColumns}
            data={partVariations}
            onRowClick={(row) => setSelectedPartVariationId(row.id)}
            highlightRow={(row) => row.id === selectedPartVariationId}
          />
          <div className="py-4" />
          {selectedPartVariationId && isPending ? (
            <Icons.spinner className="mx-auto animate-spin" />
          ) : (
            partVariationTree && (
              <>
                <h1 className="text-xl font-bold">Sub-assemblies</h1>
                <div className="py-2" />
                <div className="flex">
                  <div className="w-3/5">
                    <DataTable
                      columns={partVariationComponentColumns}
                      data={partVariationTree.components.map((child) => ({
                        count: child.count,
                        ...child.partVariation,
                      }))}
                      onRowClick={(row) => setSelectedPartVariationId(row.id)}
                    />
                  </div>
                  <div className="w-2/5">
                    <PartVariationTreeVisualization
                      tree={partVariationTree}
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
              </>
            )
          )}
        </>
      )}
      <div className="py-4" />
    </div>
  );
}
