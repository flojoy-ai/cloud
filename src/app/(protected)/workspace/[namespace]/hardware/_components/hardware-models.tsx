"use client";
import { modelColumns } from "~/components/hardware/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";
import CreateModel from "./create-model";
import { Model } from "~/schemas/public/Model";
import { useRouter } from "next/navigation";

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
      <div className="grid grid-cols-3 items-start gap-4">
        <div className="col-span-3 grid">
          <h1 className="text-lg font-bold text-muted-foreground">
            Device Models
          </h1>
          <div className="text-muted-foreground">
            This is a standalone model.
          </div>
          <div className="py-2" />
          <DataTable
            columns={modelColumns}
            data={models}
            onRowClick={(row) =>
              router.push(`/workspace/${namespace}/model/${row.id}`)
            }
          />
          <div className="py-4" />
        </div>
        {/* <div className="col-span-2 grid"> */}
        {/*   <h1 className="text-lg font-bold text-muted-foreground"> */}
        {/*     System Models */}
        {/*   </h1> */}
        {/*   <div className="text-muted-foreground"> */}
        {/*     A system model is composed of multiple device models. */}
        {/*   </div> */}
        {/*   <div className="py-2" /> */}
        {/*   <DataTable columns={systemModelColumns} data={systemModels} /> */}
        {/*   <div className="py-4" /> */}
        {/* </div> */}
      </div>
    </div>
  );
}
