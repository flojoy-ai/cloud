"use client";

import { columns } from "~/components/measurement/columns";
import { DataTable } from "~/components/measurement/data-table";
import { useRouter } from "next/navigation";
import { type MeasurementWithHardwareAndTest } from "~/types/measurement";

type Props = {
  measurements: MeasurementWithHardwareAndTest[];
  namespace: string;
};

export function MeasurementsDataTable({ measurements, namespace }: Props) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={measurements}
      onRowClick={(row) =>
        router.push(`/workspace/${namespace}/measurement/${row.id}`)
      }
    />
  );
}
