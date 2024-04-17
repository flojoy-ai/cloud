import CenterLoadingSpinner from "@/components/center-loading-spinner";
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
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import CreatePartVariation, {
  CreatePartVariationDefaultValues,
} from "@/components/unit/create-part-variation";
import { PartVariationTreeVisualization } from "@/components/visualization/tree-visualization";
import { useWorkspaceUser } from "@/hooks/use-workspace-user";
import { client } from "@/lib/client";
import { getPartQueryOpts } from "@/lib/queries/part";
import {
  getPartPartVariationsQueryOpts,
  getPartVariationQueryKey,
  getPartVariationQueryOpts,
  getPartVariationsQueryOpts,
} from "@/lib/queries/part-variation";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import { PartVariation, PartVariationTreeNode } from "@cloud/shared";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/part/$partId/",
)({
  pendingComponent: CenterLoadingSpinner,
  component: PartPage,
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

const partVariationColumns: (
  openCreateDialog: (variant: PartVariation) => Promise<void>,
) => ColumnDef<PartVariation & { unitCount: number }>[] = (
  openCreateDialog: (variant: PartVariation) => Promise<void>,
) => [
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
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const partVariant = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                toast.promise(navigator.clipboard.writeText(partVariant.id), {
                  success: "Copied ID to clipboard.",
                })
              }
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                openCreateDialog(partVariant);
              }}
            >
              <div className="flex gap-x-2">
                <Plus size={20} className="stroke-muted-foreground" />
                <div>New variant based on this</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

function PartPage() {
  const { workspace } = Route.useRouteContext();
  const { partId } = Route.useParams();

  const [createOpen, setCreateOpen] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { workspaceUserPerm } = useWorkspaceUser();

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
      if (error) throw error.value;
      return data;
    },
    queryKey: getPartVariationQueryKey(selectedPartVariationId ?? ""),
    enabled: selectedPartVariationId !== undefined,
  });

  const [defaultValues, setDefaultValues] = useState<
    CreatePartVariationDefaultValues | undefined
  >();

  const openCreateDialog = useCallback(
    async (variant?: PartVariation) => {
      if (variant) {
        const tree = await queryClient.ensureQueryData(
          getPartVariationQueryOpts({
            partVariationId: variant.id,
            context: { workspace },
          }),
        );
        setDefaultValues({
          partNumber: tree.partNumber,
          hasComponents: tree.components.length > 0,
          components: tree.components.map((c) => ({
            count: c.count,
            partVariationId: c.partVariation.id,
          })),
          description: tree.description ?? undefined,
        });
      } else {
        setDefaultValues(undefined);
      }

      setCreateOpen(true);
    },
    [queryClient, workspace],
  );

  const columns = useMemo(
    () => partVariationColumns(openCreateDialog),
    [openCreateDialog],
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
      {workspaceUserPerm.canWrite() && (
        <>
          <div className="py-2" />
          <CreatePartVariation
            workspaceId={workspace.id}
            partVariations={allPartVariations}
            part={part}
            open={createOpen}
            setOpen={setCreateOpen}
            openDialog={openCreateDialog}
            defaultValues={defaultValues}
            setDefaultValues={setDefaultValues}
          />
        </>
      )}
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
            columns={columns}
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
