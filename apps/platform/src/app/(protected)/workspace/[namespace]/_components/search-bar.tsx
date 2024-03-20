"use client";

import { Cpu, FolderKanban, Route } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { SearchResult } from "~/types/search";
import { keepPreviousData } from "@tanstack/react-query";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@cloud/ui/components/ui/command";
import { useRouter } from "next/navigation";

type HighlightProps = {
  text: string;
  pattern: string;
};

const Highlight = ({ text, pattern }: HighlightProps) => {
  if (text.length < pattern.length) {
    return <div>{text}</div>;
  }

  const start = text.toLowerCase().indexOf(pattern.toLowerCase());
  if (start === -1) {
    return <div>{text}</div>;
  }
  const end = start + pattern.length;

  return (
    <div>
      {text.slice(0, start)}
      <span className="font-medium underline">{text.slice(start, end)}</span>
      {text.slice(end)}
    </div>
  );
};

const typeIcons = {
  model: Route,
  hardware: Cpu,
  project: FolderKanban,
};

type SearchResultProps = {
  result: SearchResult;
  query: string;
  namespace: string;
};

const SearchResultItem = ({ result, namespace, query }: SearchResultProps) => {
  const type = result.type;
  const Icon = typeIcons[type];
  const router = useRouter();
  return (
    <CommandItem
      className="flex cursor-pointer"
      onClick={() =>
        router.push(`/workspace/${namespace}/${type}/${result.id}`)
      }
    >
      <Icon className="mr-2 mt-0.5 h-4 w-4 stroke-muted-foreground" />
      <span>
        <Highlight text={result.name} pattern={query} />
      </span>
    </CommandItem>
  );
};

type Props = {
  workspaceId: string;
  namespace: string;
};

const resultType = (type: SearchResult["type"]) => {
  return (res: SearchResult) => res.type === type;
};

const SearchBar = ({ workspaceId, namespace }: Props) => {
  const [query, setQuery] = useState("");

  const { data, isFetching } = api.search.search.useQuery(
    {
      query,
      workspaceId,
    },
    { placeholderData: keepPreviousData },
  );
  const searchResults = data ?? [];
  const hardware = searchResults.filter(resultType("hardware"));
  const models = searchResults.filter(resultType("model"));
  const projects = searchResults.filter(resultType("project"));

  const showResults = query !== "" && (searchResults.length > 0 || !isFetching);

  return (
    <div className="relative w-full">
      <Command shouldFilter={false} className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search..." onValueChange={setQuery} />
        <CommandList className="max-h-min">
          {showResults && (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              {hardware.length > 0 && (
                <CommandGroup heading="Hardware">
                  {hardware.map((r) => (
                    <SearchResultItem
                      namespace={namespace}
                      result={r}
                      key={r.id}
                      query={query}
                    />
                  ))}
                </CommandGroup>
              )}
              {models.length > 0 && (
                <CommandGroup heading="Model">
                  {models.map((r) => (
                    <SearchResultItem
                      namespace={namespace}
                      result={r}
                      key={r.id}
                      query={query}
                    />
                  ))}
                </CommandGroup>
              )}
              {projects.length > 0 && (
                <CommandGroup heading="Projects">
                  {projects.map((r) => (
                    <SearchResultItem
                      namespace={namespace}
                      result={r}
                      key={r.id}
                      query={query}
                    />
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </Command>
      {/* {searchResults.map((r) => ( */}
      {/*   <SearchResultItem */}
      {/*     namespace={namespace} */}
      {/*     result={r} */}
      {/*     key={r.id} */}
      {/*     query={query} */}
      {/*   /> */}
      {/* ))} */}
    </div>
  );
};

export default SearchBar;
