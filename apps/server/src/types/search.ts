import { t, Static } from "elysia";

export const searchInput = t.Object({
  query: t.String(),
  workspaceId: t.String(),
});

export type SearchInput = Static<typeof searchInput>;

export const searchResult = t.Object({
  id: t.String(),
  name: t.String(),
  type: t.Union([
    t.Literal("model"),
    t.Literal("hardware"),
    t.Literal("project"),
  ]),
});

export type SearchResult = Static<typeof searchResult>;
