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
import { useState } from "react";
import { type SelectProject } from "~/types/project";
import { useExplorerStore } from "~/store/explorer";
import { useShallow } from "zustand/react/shallow";

type Props = {
  projects: SelectProject[];
};

export function ProjectCombobox({ projects }: Props) {
  const [open, setOpen] = useState(false);

  const { selectedProject, setSelectedProject } = useExplorerStore(
    useShallow((state) => ({
      selectedProject: state.selectedProject,
      setSelectedProject: state.setSelectedProject,
    })),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedProject
            ? projects.find((project) => project.id === selectedProject.id)
                ?.name
            : "Select project..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Select project..." />
          <CommandEmpty>No project found.</CommandEmpty>
          <CommandGroup>
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.id}
                onSelect={(currentValue) => {
                  setSelectedProject(
                    currentValue === selectedProject?.id
                      ? undefined
                      : projects.find((project) => project.id === currentValue),
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedProject?.id === project.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
