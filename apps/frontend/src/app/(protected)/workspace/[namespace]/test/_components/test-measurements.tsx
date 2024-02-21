"use client";

import { Button } from "@cloud/ui/components/ui/button";
import { useState } from "react";
import { MeasurementsDataTable } from "~/components/measurements-data-table";
import { usePaginate } from "~/hooks/use-paginate";
import { Paginated } from "~/lib/db-utils";
import { api } from "~/trpc/react";
import { SelectMeasurement } from "~/types/measurement";

type Props = {
  testId: string;
  namespace: string;
  initialData: Paginated<SelectMeasurement>;
};

type QueryArgs = {
  testId: string;
  pageSize: number;
  tags?: string[];
  name?: string;
};

export function TestMeasurements({ testId, namespace, initialData }: Props) {
  // TODO: Support multiple tags
  const [queryArgs, setQueryArgs] = useState<QueryArgs>({
    testId,
    pageSize: 5,
  });

  const { data, prev, hasPrevPage, next, hasNextPage } = usePaginate(
    api.measurement.getAllMeasurementsByTestIdPaginated,
    queryArgs,
    initialData,
  );

  return (
    <div>
      <MeasurementsDataTable
        measurements={data.rows}
        namespace={namespace}
        tag={queryArgs.tags?.[0]}
        query={queryArgs.name}
        setTag={(val) =>
          setQueryArgs({ ...queryArgs, tags: val ? [val] : undefined })
        }
        setQuery={(val) => setQueryArgs({ ...queryArgs, name: val })}
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
