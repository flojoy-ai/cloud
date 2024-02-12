"use client";

import { hardwareColumns } from "~/components/hardware/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";

import CreateHardware from "~/components/hardware/create-hardware";
import { Plus } from "lucide-react";
import { Model } from "~/schemas/public/Model";
import { Hardware } from "~/schemas/public/Hardware";
import { Project } from "~/schemas/public/Project";
import { useRouter } from "next/navigation";

type Props = {
  hardware: (Hardware & { model: Model; projects: Project[] })[];
  models: Model[];
  workspaceId: string;
  namespace: string;
};

export default function HardwareInstances({
  hardware: initialData,
  models,
  workspaceId,
  namespace,
}: Props) {
  const { data: hardware } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId: workspaceId,
    },
    { initialData },
  );
  const router = useRouter();

  return (
    <div className="">
      <div className="py-2" />
      <h1 className="text-xl font-bold">Hardware Instances</h1>
      <div className="py-1" />
      <CreateHardware workspaceId={workspaceId} models={models}>
        <div className="flex items-center gap-1">
          <Plus size={20} />
          <div>Create</div>
        </div>
      </CreateHardware>
      <div className="py-4" />
      <DataTable
        columns={hardwareColumns}
        data={hardware}
        onRowClick={(row) =>
          router.push(`/workspace/${namespace}/hardware/${row.id}`)
        }
      />
      <div className="py-4" />
    </div>
  );
}
