"use client";

import { hardwareColumns } from "~/components/hardware/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";

import CreateHardware from "~/components/hardware/create-hardware";
import { Plus } from "lucide-react";
import { Model } from "~/schemas/public/Model";
import { Hardware } from "~/schemas/public/Hardware";
import { Project } from "~/schemas/public/Project";

type Props = {
  hardware: (Hardware & { model: Model; projects: Project[] })[];
  models: Model[];
  workspaceId: string;
};

export default function HardwareInstances({
  hardware: initialData,
  models,
  workspaceId,
}: Props) {
  const { data: hardware } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId: workspaceId,
    },
    { initialData },
  );

  return (
    <div className="">
      <div className="py-2" />
      <h1 className="text-2xl font-bold">Hardware</h1>
      <CreateHardware workspaceId={workspaceId} models={models}>
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateHardware>
      <DataTable columns={hardwareColumns} data={hardware} />
      <div className="py-4" />
    </div>
  );
}
