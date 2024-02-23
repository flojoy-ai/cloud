import { DataTable, DataTableProps } from "@cloud/ui/components/ui/data-table";
import { Paginated } from "~/lib/db-utils";
import { Button } from "@cloud/ui/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Skeleton } from "@cloud/ui/components/ui/skeleton";

type Props<TData, TValue> = Omit<DataTableProps<TData, TValue>, "data"> & {
  data: Paginated<TData> | undefined;
  pageSize: number;
  next: () => void;
  prev: () => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export function PaginatedDataTable<TData, TValue>({
  columns,
  pageSize,
  data,
  onRowClick,
  next,
  prev,
  hasPrevPage,
  hasNextPage,
}: Props<TData, TValue>) {
  const skeletonHeight = 65 * pageSize + 48;

  return (
    <div>
      {data ? (
        <DataTable columns={columns} data={data.rows} onRowClick={onRowClick} />
      ) : (
        <Skeleton
          className="w-full rounded-md"
          style={{ height: skeletonHeight }}
        />
      )}
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={!hasPrevPage}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={next}
          disabled={!hasNextPage}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
