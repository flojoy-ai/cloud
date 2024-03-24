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
import { ModelTreeVisualization } from "@/components/visualization/model-tree-visualization";
import { client } from "@/lib/client";
import { Model } from "@cloud/server/src/schemas/public/Model";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$familyId/",
)({
  component: FamilyPage,
  beforeLoad: async ({ context: { workspaceId }, params: { familyId } }) => {
    const { data: models, error: modelError } = await client.model.index.get({
      query: { workspaceId },
    });
    if (modelError) throw modelError;
    const { data: family, error: familyError } = await client
      .family({ familyId })
      .get({
        query: { workspaceId },
      });

    if (familyError) throw familyError;
    return { models, family };
  },
});

const modelColumns: ColumnDef<Model>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
];

function FamilyPage() {
  const { workspaceId, models, family } = Route.useRouteContext();
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );

  const { data: modelTree, isPending } = useQuery({
    queryFn: async () => {
      if (!selectedModelId) return undefined;
      const { data, error } = await client
        .model({ modelId: selectedModelId })
        .get({ query: { workspaceId } });
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
        <PageHeaderDescription>
          Here you can find all of the parts registered under this family.
          <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      <Separator />

      <div className="py-2" />

      <div>
        <h1 className="text-xl font-bold">Part Models</h1>
        <div className="py-1" />
        <CreateModel
          workspaceId={workspaceId}
          models={models}
          family={family}
        />
        <div className="py-4" />

        <DataTable
          columns={modelColumns}
          data={models}
          onRowClick={(row) => setSelectedModelId(row.id)}
        />
      </div>
      <div className="py-4" />

      {selectedModelId && isPending ? (
        <Icons.spinner className="mx-auto animate-spin" />
      ) : (
        modelTree && (
          <div className="h-96 w-full border rounded-md">
            <ModelTreeVisualization tree={modelTree} />
          </div>
        )
      )}

      <div className="py-4" />

      <Separator />

      <div className="py-4" />
    </div>
  );
}
