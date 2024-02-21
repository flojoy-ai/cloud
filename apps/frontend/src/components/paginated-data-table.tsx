import { DataTable, DataTableProps } from "@cloud/ui/components/ui/data-table";
import { Paginated } from "~/lib/db-utils";
import { Button } from "@cloud/ui/components/ui/button";

type Props<TData, TValue> = Omit<DataTableProps<TData, TValue>, "data"> & {
  data: Paginated<TData>;
  next: () => void;
  prev: () => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export function PaginatedDataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  next,
  prev,
  hasPrevPage,
  hasNextPage,
}: Props<TData, TValue>) {
  return (
    <div>
      <DataTable columns={columns} data={data.rows} onRowClick={onRowClick} />
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
