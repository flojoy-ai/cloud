"use client";
import { modelColumns } from "~/components/hardware/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";
import CreateModel from "./create-model";
import { Model } from "~/schemas/public/Model";

type Props = {
  workspaceId: string;
  models: Model[];
};

export default function HardwareModels(props: Props) {
  const { data: models } = api.model.getAllModels.useQuery(
    {
      workspaceId: props.workspaceId,
    },
    { initialData: props.models },
  );
  const { data: model } = api.model.getModelById.useQuery({
    modelId: models[4]!.id,
  });
  console.log(model);

  return (
    <div>
      <div className="py-2" />

      <h1 className="text-2xl font-bold">Hardware Models</h1>
      <div className="py-1" />
      <CreateModel workspaceId={props.workspaceId} models={models} />
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
          <DataTable columns={modelColumns} data={models} />
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
