"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
  onAdd,
}: React.HTMLAttributes<HTMLDivElement> & {
  onAdd?: (range: DateRange | undefined) => void;
}) {
  const today = new Date();
  const start = new Date(today);
  start.setHours(15, 0, 0, 0);

  const end = addDays(today, 7);
  end.setHours(12, 0, 0, 0);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: start,
    to: end,
  });

  const [open, setOpen] = React.useState(false);

  const handleAdd = () => {
    if (!date?.from || !date?.to) return;
  
    // Set to 15:00 UTC for start
    const adjustedFrom = new Date(Date.UTC(
      date.from.getFullYear(),
      date.from.getMonth(),
      date.from.getDate(),
      15, 0, 0, 0
    ));
  
    // Set to 12:00 UTC for end
    const adjustedTo = new Date(Date.UTC(
      date.to.getFullYear(),
      date.to.getMonth(),
      date.to.getDate(),
      12, 0, 0, 0
    ));
  
    if (onAdd) {
      onAdd({ from: adjustedFrom, to: adjustedTo });
    }
  
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
          <div className="flex flex-col items-start gap-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              fromDate={new Date()}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
            <Button onClick={handleAdd} className="self-end">
              Add
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}