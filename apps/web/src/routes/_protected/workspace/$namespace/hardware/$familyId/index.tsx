import CreateModel from "@/components/hardware/create-model";
import { Icons } from "@/components/icons";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/client";
import { getFamilyOpts } from "@/lib/queries/family";
import { getFamilyModelsOpts } from "@/lib/queries/model";
import { Model } from "@cloud/server/src/schemas/public/Model";
import { ModelTree } from "@cloud/server/src/types/model";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId/",
)({
  component: FamilyPage,
  loader: ({ context, params: { familyId } }) => {
    context.queryClient.ensureQueryData(
      getFamilyModelsOpts({ familyId, context }),
    );
    context.queryClient.ensureQueryData(getFamilyOpts({ familyId, context }));
  },
});

const modelColumns: ColumnDef<Model>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link
          from={Route.fullPath}
          to="$modelId"
          params={{ modelId: row.original.id }}
        >
          <Badge>{row.original.name}</Badge>
        </Link>
      );
    },
  },
];

const modelComponentColumns: ColumnDef<ModelTree & { count: number }>[] = [
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
    getFamilyModelsOpts({ familyId, context: { workspace } }),
  );

  const { data: family } = useSuspenseQuery(
    getFamilyOpts({ familyId, context: { workspace } }),
  );

  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
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
            <DataTable
              columns={modelComponentColumns}
              data={modelTree.components.map((child) => ({
                count: child.count,
                ...child.model,
              }))}
              onRowClick={(row) => setSelectedModelId(row.id)}
            />
            {/* <div className="h-96 w-full border rounded-md"> */}
            {/*   <ModelTreeVisualization tree={modelTree} /> */}
            {/* </div> */}
          </>
        )
      )}
      <div className="py-4" />
      <Separator />
      <div className="py-4" />
    </div>
  );
}
