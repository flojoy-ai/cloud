"use client";

import { deviceColumns, systemColumns } from "~/components/device/columns";
import { DataTable } from "~/components/device/data-table";
import { api } from "~/trpc/react";

import { type SelectSystem, type SelectDevice } from "~/types/hardware";

type Props = {
  devices: SelectDevice[];
  systems: SelectSystem[];
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
      <h1 className="text-2xl font-bold">Hardware Instances</h1>
      <div className="py-1" />
      <h1 className="text-lg font-bold text-muted-foreground">Devices</h1>
      <div className="py-2" />
      <DataTable columns={deviceColumns} data={devices} />
      <div className="py-4" />
      <h1 className="text-lg font-bold text-muted-foreground">Systems</h1>
      <div className="py-2" />
      <DataTable columns={systemColumns} data={systems} />
      <div className="py-4" />
    </div>
  );
}
