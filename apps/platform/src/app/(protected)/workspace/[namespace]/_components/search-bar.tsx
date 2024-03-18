"use client";

import { Input } from "@cloud/ui/components/ui/input";
import { Search, Cpu, FolderKanban, Route } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { SearchResult } from "~/types/search";
import { match } from "ts-pattern";
import Link from "next/link";

type SearchResultProps = {
  result: SearchResult;
  namespace: string;
};

const SearchResultItem = ({ result, namespace }: SearchResultProps) => {
  return match(result)
    .with({ type: "model" }, () => (
      <Link href={`/workspace/${namespace}/model/${result.id}`}>
        <div className="border p-2 hover:bg-muted-foreground/20">
          <div className="flex items-center gap-x-2">
            <Route size={20} className="stroke-muted-foreground" />
            <div>{result.name}</div>
          </div>
        </div>
      </Link>
    ))
    .with({ type: "hardware" }, () => (
      <Link href={`/workspace/${namespace}/hardware/${result.id}`}>
        <div className="border p-2 hover:bg-muted-foreground/20">
          <div className="flex items-center gap-x-2">
            <Cpu size={20} className="stroke-muted-foreground" />
            <div>{result.name}</div>
          </div>
        </div>
      </Link>
    ))
    .with({ type: "project" }, () => (
      <Link href={`/workspace/${namespace}/hardware/${result.id}`}>
        <div className="border p-2 hover:bg-muted-foreground/20">
          <div className="flex items-center gap-x-2">
            <FolderKanban size={20} className="stroke-muted-foreground" />
            <div>{result.name}</div>
          </div>
        </div>
      </Link>
    ))
    .exhaustive();
};

type Props = {
  workspaceId: string;
  namespace: string;
};

const SearchBar = ({ workspaceId, namespace }: Props) => {
  const [query, setQuery] = useState("");

  const { data } = api.search.search.useQuery({
    query,
    workspaceId,
  });
  const searchResults = data ?? [];
  console.log(searchResults);

  return (
    <div className="relative w-full">
      <Search
        className="absolute left-2.5 top-2.5 stroke-muted-foreground"
        size={20}
      />
      <Input
        placeholder="Search..."
        className="ps-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="py-1" />
      {searchResults.map((r) => (
        <SearchResultItem namespace={namespace} result={r} key={r.id} />
      ))}
    </div>
  );
};

export default SearchBar;
