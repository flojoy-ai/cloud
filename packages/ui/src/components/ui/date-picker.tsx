import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import * as React from "react";

import { Button } from "@cloud/ui/components/ui/button";
import { Calendar } from "@cloud/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cloud/ui/components/ui/popover";

import { cn } from "~/lib/utils";

type DatePickerProps = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder: string;
};

export function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-40 justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
