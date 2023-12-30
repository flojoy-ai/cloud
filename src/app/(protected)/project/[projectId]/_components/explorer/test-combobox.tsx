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
import { type SelectTest } from "~/types/test";
import { useExplorerStore } from "~/store/explorer";
import { useShallow } from "zustand/react/shallow";

type Props = {
  tests: SelectTest[];
};

export function TestCombobox({ tests }: Props) {
  const [open, setOpen] = useState(false);

  const { selectedTest, setSelectedTest } = useExplorerStore(
    useShallow((state) => ({
      selectedTest: state.selectedTest,
      setSelectedTest: state.setSelectedTest,
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
            {selectedTest
              ? tests.find((test) => test.id === selectedTest.id)?.name
              : "Select test..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Select test..." />
          <CommandEmpty>No test found.</CommandEmpty>
          <CommandGroup>
            {tests.map((test) => (
              <CommandItem
                key={test.id}
                value={test.id}
                onSelect={(currentValue) => {
                  setSelectedTest(
                    currentValue === selectedTest?.id
                      ? undefined
                      : tests.find((test) => test.id === currentValue),
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedTest?.id === test.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {test.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
