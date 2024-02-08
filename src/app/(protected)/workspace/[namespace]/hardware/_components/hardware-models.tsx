"use client";
import { modelColumns } from "~/components/hardware/columns";
import { DataTable } from "./data-table";
import { api } from "~/trpc/react";
import CreateModel from "./create-model";
import { Model } from "~/schemas/public/Model";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";

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
        renderSubComponent={renderSubComponent}
      />
    </div>
  );
}

const renderSubComponent = ({ row }: { row: Row<Model> }) => {
  return (
    <pre style={{ fontSize: "10px" }}>
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  );
};
