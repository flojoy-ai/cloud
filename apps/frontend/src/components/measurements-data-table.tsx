import { columns } from "~/components/measurement/columns";
import { useRouter } from "next/navigation";
import { type SelectMeasurement } from "~/types/measurement";
import { Input } from "@cloud/ui/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cloud/ui/components/ui/select";
import _ from "lodash";
import { PaginatedDataTable } from "./paginated-data-table";
import { Paginated } from "~/lib/db-utils";

type Props = {
  namespace: string;
  query: string | undefined;
  setQuery: (query: string | undefined) => void;
  tag: string | undefined;
  setTag: (tag: string | undefined) => void;
  data: Paginated<SelectMeasurement> | undefined;
  pageSize: number;
  next: () => void;
  prev: () => void;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export function MeasurementsDataTable({
  data,
  namespace,
  query,
  setQuery,
  tag,
  setTag,
  pageSize,
  next,
  prev,
  hasPrevPage,
  hasNextPage,
}: Props) {
  const router = useRouter();

  const onRowClick = (row: SelectMeasurement) => {
    router.push(`/workspace/${namespace}/measurement/${row.id}?back=true`);
  };

  // const allTags = _.uniq(data.flatMap((x) => x.tags.map((t) => t.name)));
  const allTags: string[] = [];

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
      <PaginatedDataTable
        columns={columns}
        onRowClick={onRowClick}
        data={data}
        next={next}
        prev={prev}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
      />
    </div>
  );
}
