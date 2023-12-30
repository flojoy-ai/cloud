"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type SelectWorkspace } from "~/types/workspace";
import { useState } from "react";
import { useExplorerStore } from "~/store/explorer";
import { useShallow } from "zustand/react/shallow";

type Props = {
  workspaces: SelectWorkspace[];
};

export function WorkspaceCombobox({ workspaces }: Props) {
  const [open, setOpen] = useState(false);

  const { selectedWorkspace, setSelectedWorkspace } = useExplorerStore(
    useShallow((state) => ({
      selectedWorkspace: state.selectedWorkspace,
      setSelectedWorkspace: state.setSelectedWorkspace,
    })),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between text-left"
        >
          <div className="block w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedWorkspace
              ? workspaces.find(
                  (workspace) => workspace.id === selectedWorkspace.id,
                )?.name
              : "Select workspace..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Select workspace..." />
          <CommandEmpty>No workspace found.</CommandEmpty>
          <CommandGroup>
            {workspaces.map((workspace) => (
              <CommandItem
                key={workspace.id}
                value={workspace.id}
                onSelect={(currentValue) => {
                  setSelectedWorkspace(
                    currentValue === selectedWorkspace?.id
                      ? undefined
                      : workspaces.find(
                          (workspace) => workspace.id === currentValue,
                        ),
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedWorkspace?.id === workspace.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {workspace.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
