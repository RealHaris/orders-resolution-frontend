"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

import {
  parseDateInput,
  toDateInputValueFromDate,
} from "@/common/utils/date";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * A date-range picker that stores start / end as `YYYY-MM-DD` strings.
 * Renders a two-month calendar inside a Popover so the user picks both
 * dates in one step instead of two separate pickers.
 */
export function DateRangePicker({
  id,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
}: {
  id?: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const range: DateRange = {
    from: parseDateInput(startDate),
    to: parseDateInput(endDate),
  };

  const label =
    range.from && range.to
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : range.from
        ? format(range.from, "MMM d, yyyy")
        : "Pick a date range";

  const handleSelect = (selected: DateRange | undefined) => {
    const from = selected?.from
      ? toDateInputValueFromDate(selected.from)
      : "";
    const to = selected?.to
      ? toDateInputValueFromDate(selected.to)
      : "";

    onStartDateChange(from);
    onEndDateChange(to);

    // Close only once both ends are chosen
    if (selected?.from && selected?.to) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full justify-start font-normal"
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={range.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
