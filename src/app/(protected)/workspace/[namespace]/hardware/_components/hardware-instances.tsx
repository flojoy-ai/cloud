"use client";

import { deviceColumns, systemColumns } from "~/components/hardware/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";

import { type SelectSystem, type SelectDevice } from "~/types/hardware";
import { type SelectProject } from "~/types/project";
import CreateDevice from "~/components/hardware/create-device";
import CreateSystem from "~/components/hardware/create-system";
import { type SelectDeviceModel, type SelectSystemModel } from "~/types/model";
import { Plus } from "lucide-react";

type Props = {
  devices: (SelectDevice & { projects: SelectProject[] })[];
  systems: (SelectSystem & { projects: SelectProject[] })[];
  deviceModels: SelectDeviceModel[];
  systemModels: SelectSystemModel[];
  workspaceId: string;
};

export default function HardwareInstances(props: Props) {
  const { data: devices } = api.hardware.getAllDevices.useQuery(
    {
      workspaceId: props.workspaceId,
    },
    { initialData: props.devices },
  );
  const { data: systems } = api.hardware.getAllSystems.useQuery(
    {
      workspaceId: props.workspaceId,
    },
    { initialData: props.systems },
  );

  return (
    <div className="">
      <div className="py-2" />
      <h1 className="text-2xl font-bold">Hardware Instances</h1>
      <div className="py-1" />
      <h1 className="text-lg font-bold text-muted-foreground">Devices</h1>
      <div className="py-1" />
      <CreateDevice workspaceId={props.workspaceId} models={props.deviceModels}>
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateDevice>
      <div className="py-2" />
      <DataTable columns={deviceColumns} data={devices} />
      <div className="py-4" />
      <h1 className="text-lg font-bold text-muted-foreground">Systems</h1>
      <div className="py-1" />
      <CreateSystem
        workspaceId={props.workspaceId}
        systemModels={props.systemModels}
      >
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateSystem>
      <div className="py-2" />
      <DataTable columns={systemColumns} data={systems} />
      <div className="py-4" />
    </div>
  );
}
