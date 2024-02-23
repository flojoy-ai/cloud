import { DecoratedQuery } from "node_modules/@trpc/react-query/dist/createTRPCReact";
import { useState } from "react";
import { Paginated } from "~/lib/db-utils";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";

type PaginatedEndpointDef<O> = {
  input: any;
  output: Paginated<O>;
  transformer: boolean;
  errorShape: any;
};

type UsePaginateResult<T> = UseTRPCQueryResult<T, unknown> & {
  next: () => void;
  prev: () => void;
  reset: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export const usePaginate = <O, D extends PaginatedEndpointDef<O>>(
  endpoint: DecoratedQuery<D>,
  args: D["input"],
): UsePaginateResult<D["output"]> => {
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [pageIndex, setPageIndex] = useState(0);
  const res = endpoint.useQuery(
    {
      ...args,
      after: cursorHistory[pageIndex],
    },
  );

  const reset = () => {
    setCursorHistory([undefined]);
    setPageIndex(0);
  };

  const prev = () => {
    setPageIndex(pageIndex - 1);
  };

  const next = () => {
    if (pageIndex === cursorHistory.length - 1 && res.data?.endCursor) {
      setCursorHistory([...cursorHistory, res.data?.endCursor]);
    }
    setPageIndex(pageIndex + 1);
  };

  const hasNextPage =
    res.data?.hasNextPage || pageIndex < cursorHistory.length - 1;
  const hasPrevPage = res.data?.hasPrevPage || pageIndex > 0;

  return { ...res, next, prev, hasNextPage, hasPrevPage, reset };
};
