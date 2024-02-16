import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "@cloud/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@cloud/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cloud/ui/components/ui/popover";
import { useState } from "react";

type Props<T> = {
  options: T[];
  value: T | undefined;
  setValue: (test: T | undefined) => void;
  displaySelector: (val: T) => string;
  valueSelector: (val: T) => string;
  placeholder?: string;
};

export function Combobox<T>({
  options,
  value,
  setValue,
  displaySelector,
  valueSelector,
  placeholder,
}: Props<T>) {
  const [open, setOpen] = useState(false);

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
            {value ? displaySelector(value) : "Select..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>Nothing found.</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={valueSelector(opt)}
                value={valueSelector(opt)}
                onSelect={(val) => {
                  setValue(
                    value !== undefined && val === valueSelector(value)
                      ? undefined
                      : options.find((opt) => valueSelector(opt) === val),
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value !== undefined &&
                      valueSelector(value) === valueSelector(opt)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {displaySelector(opt)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
