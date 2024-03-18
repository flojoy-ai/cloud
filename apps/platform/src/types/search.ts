import { z } from "zod";

export const searchInput = z.object({
  query: z.string(),
  workspaceId: z.string(),
});

export const searchResult = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["model", "hardware", "project"]),
});

export type SearchResult = z.infer<typeof searchResult>;
