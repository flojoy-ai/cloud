"use client";

import { hardwareColumns } from "~/components/hardware/columns";
import { api } from "~/trpc/react";

import CreateHardware from "~/components/hardware/create-hardware";
import { Plus } from "lucide-react";
import { Model } from "~/schemas/public/Model";
import { useRouter } from "next/navigation";
import { usePaginate } from "~/hooks/use-paginate";
import { PaginatedDataTable } from "~/components/paginated-data-table";

type Props = {
  models: Model[];
  workspaceId: string;
  namespace: string;
};

const PAGE_SIZE = 10;

export default function HardwareInstances({
  models,
  workspaceId,
  namespace,
}: Props) {
  const { data, next, prev, hasNextPage, hasPrevPage } = usePaginate(
    api.hardware.getAllHardwarePaginated,
    {
      workspaceId,
      pageSize: PAGE_SIZE,
    },
  );

  const router = useRouter();

  return (
    <div className="">
      <div className="py-2" />
      <h1 className="flex items-center gap-x-2 text-xl font-bold">
        <div>Hardware Instances</div>
        <CreateHardware
          workspaceId={workspaceId}
          models={models}
          buttonSize="icon"
          buttonVariant="secondary"
          className="h-8 w-8"
        >
          <Plus size={20} className="stroke-muted-foreground" />
        </CreateHardware>
      </h1>
      <div className="py-4" />
      <PaginatedDataTable
        columns={hardwareColumns}
        pageSize={PAGE_SIZE}
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
