"use client";
import {
  deviceModelColumns,
  systemModelColumns,
} from "~/components/hardware/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";
import { type SelectDeviceModel, type SelectSystemModel } from "~/types/model";
import CreateModel from "./create-model";

type Props = {
  workspaceId: string;
  deviceModels: SelectDeviceModel[];
  systemModels: SelectSystemModel[];
};

export default function HardwareModels(props: Props) {
  const { data: deviceModels } = api.model.getAllDeviceModels.useQuery(
    {
      workspaceId: props.workspaceId,
    },
    { initialData: props.deviceModels },
  );
  const { data: systemModels } = api.model.getAllSystemModels.useQuery(
    {
      workspaceId: props.workspaceId,
    },
    { initialData: props.systemModels },
  );

  return (
    <div>
      <div className="py-2" />

      <h1 className="text-2xl font-bold">Hardware Models</h1>
      <div className="py-1" />
      <CreateModel
        workspaceId={props.workspaceId}
        deviceModels={deviceModels}
      />
      <div className="py-4" />
      <div className="grid grid-cols-3 items-start gap-4">
        <div className="col-span-1 grid">
          <h1 className="text-lg font-bold text-muted-foreground">
            Device Models
          </h1>
          <div className="text-muted-foreground">
            This is a standalone model.
          </div>
          <div className="py-2" />
          <DataTable columns={deviceModelColumns} data={deviceModels} />
          <div className="py-4" />
        </div>
        <div className="col-span-2 grid">
          <h1 className="text-lg font-bold text-muted-foreground">
            System Models
          </h1>
          <div className="text-muted-foreground">
            A system model is composed of multiple device models.
          </div>
          <div className="py-2" />
          <DataTable columns={systemModelColumns} data={systemModels} />
          <div className="py-4" />
        </div>
      </div>
    </div>
  );
}
