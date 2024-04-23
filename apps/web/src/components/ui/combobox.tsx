import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { CommandList } from "cmdk";
import { ScrollArea } from "./scroll-area";

type Props<T> = {
  options: T[];
  value: string | undefined;
  setValue: (test: string | undefined) => void;
  displaySelector: (val: T) => string;
  valueSelector: (val: T) => string;
  descriptionSelector?: (val: T) => string;
  placeholder?: string;
  searchText?: string;
  avoidCollisions?: boolean;
  side?: "top" | "bottom";
  disabled?: boolean;
};

export function Combobox<T>({
  options,
  value,
  setValue,
  displaySelector,
  valueSelector,
  descriptionSelector,
  searchText,
  placeholder,
  avoidCollisions,
  side,
  disabled = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const curValue = options.find((opt) => valueSelector(opt) === value);
  const label = curValue ? displaySelector(curValue) : placeholder;

  const items = (
    <CommandList>
      <CommandEmpty>Nothing found.</CommandEmpty>
      <CommandGroup>
        <ScrollArea
          className={"[&>[data-radix-scroll-area-viewport]]:max-h-56"}
        >
          {options.map((opt) => (
            <CommandItem
              key={valueSelector(opt)}
              value={valueSelector(opt)}
              onSelect={(val) => {
                setValue(val);
                setOpen(false);
              }}
              className="cursor-pointer"
              keywords={[displaySelector(opt)]}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === valueSelector(opt) ? "opacity-100" : "opacity-0",
                )}
              />
              {descriptionSelector ? (
                <div>
                  <div className="text-sm font-medium">
                    {displaySelector(opt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {descriptionSelector(opt)}
                  </div>
                </div>
              ) : (
                displaySelector(opt)
              )}
            </CommandItem>
          ))}
        </ScrollArea>
      </CommandGroup>
    </CommandList>
  );
  const input = <CommandInput placeholder={searchText} />;

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        avoidCollisions={avoidCollisions}
        side={side}
      >
        <Command>
          {side === "bottom" && avoidCollisions ? (
            <>
              {items}
              {input}
            </>
          ) : (
            <>
              {input}
              {items}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
