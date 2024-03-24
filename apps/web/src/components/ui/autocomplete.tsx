import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Props = {
  options: string[];
  value: string;
  onChange: (test: string) => void;
  placeholder?: string;
};

export function Autocomplete({ options, value, onChange, placeholder }: Props) {
  return (
    <Command>
      <CommandInput
        placeholder={placeholder}
        value={value}
        onValueChange={onChange}
      />
      <CommandList className="max-h-[200px]">
        <CommandGroup>
          {options.map((opt) => (
            <CommandItem key={opt} value={opt} onSelect={onChange}>
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === opt ? "opacity-100" : "opacity-0",
                )}
              />
              {opt}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
