"use client";

import { useState } from "react";
import { MeasurementsDataTable } from "~/components/measurements-data-table";
import { usePaginate } from "~/hooks/use-paginate";
import { api } from "~/trpc/react";

type Props = {
  testId: string;
  namespace: string;
};

const PAGE_SIZE = 5;

export function TestMeasurements({ testId, namespace }: Props) {
  // TODO: Support multiple tags
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [tag, setTag] = useState<string | undefined>(undefined);

  const { data, prev, hasPrevPage, next, hasNextPage, reset } = usePaginate(
    api.measurement.getAllMeasurementsByTestIdPaginated,
    { testId, pageSize: PAGE_SIZE, name: query, tags: tag ? [tag] : undefined },
  );

  return (
    <div>
      <MeasurementsDataTable
        pageSize={PAGE_SIZE}
        data={data}
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
        next={next}
        prev={prev}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
