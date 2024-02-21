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

export function TestMeasurements({ testId, namespace, initialData }: Props) {
  // TODO: Support multiple tags
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [tag, setTag] = useState<string | undefined>(undefined);

  const { data, prev, hasPrevPage, next, hasNextPage, reset } = usePaginate(
    api.measurement.getAllMeasurementsByTestIdPaginated,
    { testId, pageSize: 10, name: query, tags: tag ? [tag] : undefined },
    initialData,
  );

  return (
    <div>
      <MeasurementsDataTable
        measurements={data.rows}
        namespace={namespace}
        tag={tag}
        query={query}
        setTag={(val) => {
          setTag(val);
          reset();
        }}
        setQuery={(val) => {
          setQuery(val);
          reset();
        }}
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
