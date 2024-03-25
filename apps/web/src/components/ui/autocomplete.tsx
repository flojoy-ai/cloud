import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

type Props = {
  options: string[];
  value: string;
  onChange: (test: string) => void;
  placeholder?: string;
};

export function Autocomplete({ options, value, onChange, placeholder }: Props) {
  const [selected, setSelected] = useState(false);

  return (
    <div className="relative">
      <Command>
        <CommandInput
          placeholder={placeholder}
          value={value}
          onValueChange={onChange}
          onSelect={() => setSelected(true)}
          onBlur={() => setSelected(false)}
        />
        <CommandList className="max-h-[160px] absolute top-[45px] bg-background w-full shadow-md rounded-b-lg">
          {selected && (
            <CommandGroup>
              {options.map((opt) => (
                // FIXME: Select doesn't fire when clicking
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
          )}
        </CommandList>
      </Command>
    </div>
  );
}
