"use client";
import { modelColumns } from "~/components/hardware/columns";
import { DataTable } from "./data-table";
import { api } from "~/trpc/react";
import CreateModel from "./create-model";
import { Model } from "~/schemas/public/Model";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import TreeVisualization from "../../model/_components/tree-visualization";
import { Icons } from "~/components/icons";

type Props = {
  workspaceId: string;
  namespace: string;
  models: Model[];
};

export default function HardwareModels({
  workspaceId,
  models: initialData,
  namespace,
}: Props) {
  const { data: models } = api.model.getAllModels.useQuery(
    {
      workspaceId,
    },
    { initialData },
  );

  const router = useRouter();

  return (
    <div>
      <div className="py-2" />

      <h1 className="text-2xl font-bold">Hardware Models</h1>
      <div className="py-1" />
      <CreateModel workspaceId={workspaceId} models={models} />
      <div className="py-4" />

      <DataTable
        columns={modelColumns}
        data={models}
        onRowClick={(row) =>
          router.push(`/workspace/${namespace}/model/${row.id}`)
        }
        // renderSubComponent={renderSubComponent}
      />
    </div>
  );
}

export const RenderSubComponent = ({ row }: { row: Model }) => {
  const { data: model, isLoading } = api.model.getModelById.useQuery({
    modelId: row.id,
  });

  if (isLoading) return <Icons.spinner className="animate-spin" />;
  if (!model) return <div>Visualization is not available</div>;

  return (
    <div className="h-96 w-full">
      <TreeVisualization tree={model} />
    </div>
  );
};
