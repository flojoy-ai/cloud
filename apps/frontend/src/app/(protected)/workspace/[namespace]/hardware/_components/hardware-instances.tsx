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
import { useState } from "react";
import { DataTable } from "@cloud/ui/components/ui/data-table";
import { Button } from "@cloud/ui/components/ui/button";
import { keepPreviousData } from "@tanstack/react-query";
import { usePaginate } from "~/hooks/use-paginate";

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
    },
    initialData,
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
        data={data.rows}
        onRowClick={(row) =>
          router.push(`/workspace/${namespace}/hardware/${row.id}`)
        }
      />
      <div className="py-4" />
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={next}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

