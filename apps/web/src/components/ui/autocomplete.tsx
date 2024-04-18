import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { forwardRef, useRef, useState } from "react";

type Props = {
  options: string[];
  value: string;
  onChange: (test: string) => void;
  placeholder?: string;
};

export const Autocomplete = forwardRef<HTMLInputElement, Props>(
  ({ options, value, onChange, placeholder }, ref) => {
    const [selected, setSelected] = useState(false);
    const cmdRef = useRef<HTMLDivElement | null>(null);

    return (
      <div className="relative">
        <Command ref={cmdRef}>
          <CommandInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onValueChange={onChange}
            onSelect={() => setSelected(true)}
            onBlur={(e) => {
              if (e.relatedTarget === cmdRef.current) {
                return;
              }
              setSelected(false);
            }}
          />
          <CommandList className="max-h-[160px] absolute top-[45px] bg-background w-full shadow-md rounded-b-lg z-50">
            {selected && options.length > 0 && (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={(val) => {
                      onChange(val);
                      setSelected(false);
                    }}
                  >
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
  },
);
