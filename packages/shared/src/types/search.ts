import { t, Static } from "elysia";

export const searchInput = t.Object({
  query: t.String(),
});

export type SearchInput = Static<typeof searchInput>;

export const searchResultTypes = [
  "product",
  "part",
  "partVariation",
  "unit",
  "project",
] as const;

export const searchResultType = t.Union(
  searchResultTypes.map((r) => t.Literal(r)),
);
export type SearchResultType = Static<typeof searchResultType>;

export const searchResult = t.Object({
  id: t.String(),
  name: t.String(),
  type: searchResultType,
});

export type SearchResult = Static<typeof searchResult>;
