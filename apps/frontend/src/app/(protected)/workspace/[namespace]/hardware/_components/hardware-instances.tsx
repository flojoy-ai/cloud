"use client";

import { hardwareColumns } from "~/components/hardware/columns";
import { api } from "~/trpc/react";

import CreateHardware from "~/components/hardware/create-hardware";
import { Plus } from "lucide-react";
import { Model } from "~/schemas/public/Model";
import { Hardware } from "~/schemas/public/Hardware";
import { Project } from "~/schemas/public/Project";
import { useRouter } from "next/navigation";
import { Paginated } from "~/lib/db-utils";
import { DataTable } from "@cloud/ui/components/ui/data-table";
import { Button } from "@cloud/ui/components/ui/button";
import { usePaginate } from "~/hooks/use-paginate";
import { PaginatedDataTable } from "~/components/paginated-data-table";

type Props = {
  hardware: Paginated<Hardware & { model: Model; projects: Project[] }>;
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
  const { data, next, prev, hasNextPage, hasPrevPage } = usePaginate(
    api.hardware.getAllHardwarePaginated,
    {
      workspaceId,
      pageSize: 10,
    },
    initialData,
  );

  const router = useRouter();

  return (
    <div className="">
      <div className="py-2" />
      <h1 className="flex items-center gap-x-2 text-xl font-bold">
        <div>Hardware Instances</div>
        <CreateHardware workspaceId={workspaceId} models={models}>
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Plus size={20} className="stroke-muted-foreground" />
          </Button>
        </CreateHardware>
      </h1>
      <PaginatedDataTable
        columns={hardwareColumns}
        data={data}
        onRowClick={(row) =>
          router.push(`/workspace/${namespace}/hardware/${row.id}`)
        }
        next={next}
        prev={prev}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
