import { columns } from "~/components/measurement/columns";
import { useRouter } from "next/navigation";
import { type SelectMeasurement } from "~/types/measurement";
import { Input } from "@cloud/ui/components/ui/input";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@cloud/ui/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cloud/ui/components/ui/select";
import { useState } from "react";
import _ from "lodash";

type Props = {
  measurements: SelectMeasurement[];
  namespace: string;
  query: string | undefined;
  setQuery: (query: string | undefined) => void;
  tag: string | undefined;
  setTag: (tag: string | undefined) => void;
};

export function MeasurementsDataTable({
  measurements,
  namespace,
  query,
  setQuery,
  tag,
  setTag,
}: Props) {
  const router = useRouter();

  const data = measurements;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onRowClick = (row: SelectMeasurement) => {
    router.push(`/workspace/${namespace}/measurement/${row.id}?back=true`);
  };

  const allTags = _.uniq(data.flatMap((x) => x.tags.map((t) => t.name)));

  return (
    <div>
      <div className="flex items-center gap-x-2 py-4">
        <Input
          placeholder="Search..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="max-w-sm"
        />
        <Select onValueChange={setTag} value={tag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
