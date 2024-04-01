import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Cpu,
  FolderKanban,
  FolderTree,
  Route,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { client } from "@/lib/client";
import { typedObjectEntries, typedObjectFromEntries } from "@/lib/typed";
import { cn } from "@/lib/utils";
import { Workspace, searchResultTypes, type SearchResult } from "@cloud/shared";
import { useRouter } from "@tanstack/react-router";

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
  partVariation: Route,
  hardware: Cpu,
  project: FolderKanban,
  product: ShoppingCart,
  part: FolderTree,
};

const nameLookup = {
  partVariation: "PartVariation",
  hardware: "Part Instance",
  project: "Test Project",
  product: "Product",
  part: "Part Part",
};

type SearchResultProps = {
  result: SearchResult;
  query: string;
  workspace: Workspace;
};

const SearchResultItem = ({ result, query, workspace }: SearchResultProps) => {
  const type = result.type;
  const Icon = typeIcons[type];
  const router = useRouter();
  return (
    <CommandItem
      className="flex cursor-pointer"
      value={`${result.name}-${type}`}
      onSelect={() => {
        switch (result.type) {
          case "product":
            throw new Error("not implemented");
          case "part":
            return router.navigate({
              to: `/workspace/$namespace/part/$partId`,
              params: { namespace: workspace.namespace, partId: result.id },
            });
          case "partVariation":
            return router.navigate({
              to: `/workspace/$namespace/variation/$partVariationId`,
              params: {
                namespace: workspace.namespace,
                partVariationId: result.id,
              },
            });
          case "project":
            return router.navigate({
              to: `/workspace/$namespace/project/$projectId`,
              params: {
                namespace: workspace.namespace,
                projectId: result.id,
              },
            });
          case "hardware":
            return router.navigate({
              to: `/workspace/$namespace/hardware/$hardwareId`,
              params: {
                namespace: workspace.namespace,
                hardwareId: result.id,
              },
            });
        }
      }}
    >
      <Icon className="mr-2 mt-0.5 h-4 w-4 stroke-muted-foreground" />
      <span>
        <Highlight text={result.name} pattern={query} />
      </span>
    </CommandItem>
  );
};

type Props = {
  workspace: Workspace;
  className?: string;
  emptyClassName?: string;
  activeClassName?: string;
  listClassName?: string;
  width?: string;
};

const groupSearchResults = (results: SearchResult[]) => {
  const groups = typedObjectFromEntries(
    searchResultTypes.map((t) => [t, [] as SearchResult[]]),
  );
  for (const result of results) {
    groups[result.type].push(result);
  }
  return groups;
};

const SearchBar = ({
  workspace,
  emptyClassName,
  activeClassName,
  listClassName,
}: Props) => {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState(false);
  const query = useDebounce(value, 200);

  const { data, isFetching } = useQuery({
    queryKey: ["search", query, workspace.id],
    queryFn: async () => {
      const { error, data } = await client.search.index.get({
        query: {
          query,
        },
        headers: { "flojoy-workspace-id": workspace.id },
      });
      if (error) {
        // TODO: Handle error better
        throw error.value;
      }
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const searchResults = data ?? [];
  const groups = groupSearchResults(searchResults);

  const showResults =
    query !== "" && selected && (searchResults.length > 0 || !isFetching);

  return (
    <div className="relative">
      <Command
        className={cn(
          "rounded-lg border",
          !showResults
            ? cn("rounded-lg border", emptyClassName)
            : cn("rounded-b-none border border-b-0", activeClassName),
        )}
      >
        <CommandInput
          placeholder="Type a command or search..."
          onValueChange={setValue}
          // FIXME: this hack to allow the links to be clicked properly before the component unmounts
          onBlur={() => setTimeout(() => setSelected(false), 75)}
          onFocus={() => setSelected(true)}
        />
        <CommandList
          className={cn(
            "absolute w-full bg-background top-[46px] left-0",
            {
              "border rounded-b-md border-t-0": showResults,
            },
            listClassName,
          )}
        >
          {showResults && searchResults.length === 0 && (
            <div className="py-6 text-center text-sm">No results found.</div>
          )}
          {typedObjectEntries(nameLookup).map(([type, name]) =>
            groups[type].length === 0 || !showResults ? null : (
              <CommandGroup heading={name} key={type}>
                {groups[type].map((r) => (
                  <SearchResultItem
                    result={r}
                    query={query}
                    workspace={workspace}
                  />
                ))}
              </CommandGroup>
            ),
          )}
        </CommandList>
      </Command>
    </div>
  );
};

export default SearchBar;
