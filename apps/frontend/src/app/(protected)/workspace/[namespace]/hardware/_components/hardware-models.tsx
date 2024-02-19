"use client";
import { modelColumns } from "~/components/hardware/columns";
import { DataTable } from "./data-table";
import { api } from "~/trpc/react";
import CreateModel from "./create-model";
import { Model } from "~/schemas/public/Model";
import { useRouter } from "next/navigation";
import { Icons } from "~/components/icons";
import { ModelTreeVisualization } from "~/components/visualization/tree-visualization";

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

      <h1 className="text-xl font-bold">Hardware Models</h1>
      <div className="py-1" />
      <CreateModel workspaceId={workspaceId} models={models} />
      <div className="py-4" />

      <DataTable
        columns={modelColumns}
        data={models}
        onRowClick={(row) =>
          router.push(`/workspace/${namespace}/model/${row.id}`)
        }
      />
    </div>
  );
}

export const RenderSubComponent = ({ row }: { row: Model }) => {
  const { data: model, isPending } = api.model.getModel.useQuery({
    modelId: row.id,
  });

  if (isPending) return <Icons.spinner className="mx-auto animate-spin" />;
  if (!model) return <div>Visualization is not available</div>;

  return (
    <div className="h-96 w-full">
      <ModelTreeVisualization tree={model} />
    </div>
  );
};
