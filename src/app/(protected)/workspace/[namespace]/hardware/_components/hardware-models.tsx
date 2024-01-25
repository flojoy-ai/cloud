"use client";
import {
  deviceModelColumns,
  systemModelColumns,
} from "~/components/device/columns";
import { DataTable } from "~/components/device/data-table";
import { api } from "~/trpc/react";
import { type SelectDeviceModel, type SelectSystemModel } from "~/types/model";

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
    <div className="grid grid-cols-3 items-start gap-4">
      <div className="col-span-1 grid">
        <h1 className="text-lg font-bold text-muted-foreground">
          Device Models
        </h1>
        <div className="py-2" />
        <DataTable columns={deviceModelColumns} data={deviceModels} />
        <div className="py-4" />
      </div>
      <div className="col-span-2 grid">
        <h1 className="text-lg font-bold text-muted-foreground">
          System Models
        </h1>
        <div className="py-2" />
        <DataTable columns={systemModelColumns} data={systemModels} />
        <div className="py-4" />
      </div>
    </div>
  );
}
