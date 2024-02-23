import * as React from "react";
import { parse, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button } from "@cloud/ui/components/ui/button";
import { Calendar } from "@cloud/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cloud/ui/components/ui/popover";
import { Input } from "@cloud/ui/components/ui/input";

type Props = {
  date: DateRange | undefined;
  setDate: (dates: DateRange | undefined) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const getDateWithTime = (date: Date, timeStr: string) => {
  const d = parse(timeStr, "HH:mm:ss", new Date());

  const newDate = new Date(date.getTime());

  newDate.setHours(d.getHours());
  newDate.setMinutes(d.getMinutes());
  newDate.setSeconds(d.getSeconds());

  return newDate;
};

export function DateTimeRangePicker({ className, date, setDate }: Props) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "max-w-[420px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y, HH:mm:ss")} -{" "}
                  {format(date.to, "LLL dd, y, HH:mm:ss")}
                </>
              ) : (
                format(date.from, "LLL dd, y, HH:mm:ss")
              )
            ) : (
              <span>Pick a time range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <div className="flex justify-between px-20 py-2">
            <Input
              type="time"
              step="1"
              value={date?.from ? format(date.from, "HH:mm:ss") : undefined}
              onChange={(e) => {
                if (date?.from) {
                  setDate({
                    ...date,
                    from: getDateWithTime(date.from, e.target.value),
                  });
                }
              }}
              className="w-36"
            />
            <Input
              type="time"
              value={date?.to ? format(date.to, "HH:mm:ss") : undefined}
              className="w-36"
              step="1"
              onChange={(e) => {
                if (date?.to) {
                  setDate({
                    ...date,
                    to: getDateWithTime(date.to, e.target.value),
                  });
                }
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
