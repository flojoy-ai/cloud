import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { computePassingStatus } from "@/lib/session";
import { Measurement, MeasurementData } from "@cloud/shared";
import _ from "lodash/fp";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "./status-badge";
import { match } from "ts-pattern";

type SessionTableRow = {
  name: string;
  pass: boolean | null;
  createdAt?: Date;
  durationMs?: number;
  data?: MeasurementData;
  subRows?: SessionTableRow[];
};

const nestedArrayify = (
  name: string,
  data: SessionTableRow[],
): SessionTableRow => {
  return {
    name,
    createdAt: _.min(data.map((d) => d.createdAt)),
    pass: computePassingStatus(data).passing,
    subRows: data,
  };
};

const groupMeasurements = (data: Measurement[]): SessionTableRow[] => {
  const grouped = _.pipe(
    _.groupBy((m: Measurement) => m.cycleNumber ?? 0),
    _.mapValues(_.groupBy((m: Measurement) => m.sequenceName ?? "Sequence")),
  )(data);

  const sequences = _.mapValues((seq: Record<string, Measurement[]>) =>
    _.pipe(
      _.entries,
      _.map(([name, data]) => nestedArrayify(name, data)),
      _.sortBy("name"),
    )(seq),
  )(grouped);

  const cycles = _.pipe(
    _.entries,
    _.map(([cycleNumber, sequences]) =>
      nestedArrayify(`Cycle ${cycleNumber}`, sequences),
    ),
  )(sequences);

  return cycles;
};

// const makeMeasurement = (): Measurement => ({
//   id: faker.string.uuid(),
//   name: faker.word.words({ count: 10 }),
//   testId: faker.string.uuid(),
//   unitId: faker.string.uuid(),
//   sessionId: faker.string.uuid(),
//   projectId: faker.string.uuid(),
//   cycleNumber: faker.number.int(3),
//   sequenceName: faker.helpers.arrayElement(["A", "B", "C"]),
//   data: faker.helpers.arrayElement([
//     {
//       type: "scalar",
//       value: faker.number.float({ min: 0, max: 100, fractionDigits: 4 }),
//     },
//     { type: "boolean", value: faker.datatype.boolean() },
//     { type: "dataframe", value: {} },
//   ]),
//   pass: faker.datatype.boolean(),
//   storageProvider: "postgres",
//   createdAt: faker.date.recent(),
//   isDeleted: false,
// });

const columns: ColumnDef<SessionTableRow>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return (
        <div
          style={{
            paddingLeft: `${row.depth * 2}rem`,
          }}
          className="flex items-center gap-x-2"
        >
          {row.getCanExpand() && (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
              }}
            >
              {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
            </button>
          )}
          {row.original.name}
        </div>
      );
    },
    size: 400,
  },
  {
    header: "Status",
    accessorKey: "pass",
    cell: ({ row }) => {
      return <StatusBadge status={row.original.pass} />;
    },
  },
  {
    header: "Value",
    accessorKey: "value",
    cell: ({ row }) => {
      if (!row.original.data) return null;

      const display = match(row.original.data)
        .with({ type: "scalar" }, (x) => x.value)
        .with({ type: "boolean" }, (x) => x.value.toString())
        .with({ type: "dataframe" }, () => "<Dataframe>")
        .exhaustive();

      return <div className="font-bold">{display}</div>;
    },
  },
  {
    header: "Completion Time",
    accessorKey: "durationMs",
    cell ({ row }) {
      const ms = row.original.durationMs
      return <div>{ms ? `${ms / 1000}s` : ""}</div>
    },
  },
  {
    header: "Date",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      return <div>{row.original.createdAt?.toISOString()}</div>;
    },
  },
];

type Props = {
  measurements: Measurement[];
};

export function SessionTable({ measurements }: Props) {
  const grouped = useMemo(
    () =>
      groupMeasurements(
        measurements.map((m) => ({
          ...m,
          // The type of createdAt is 'Date', but it's actually a string.
          // See db/session.ts in the server for more info
          createdAt: new Date(Date.parse(m.createdAt as unknown as string)),
        })),
      ),
    [measurements],
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: grouped,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
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
              <>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
