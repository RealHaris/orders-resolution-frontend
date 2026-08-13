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
 *
 * Selection is staged in a local draft and only committed to the parent
 * when the user clicks "Apply". "Cancel" (or dismissing the popover by
 * clicking outside / pressing Escape) discards the draft.
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
  // In-progress selection while the popover is open. Not committed until Apply.
  const [draftRange, setDraftRange] = useState<DateRange>(() => ({
    from: parseDateInput(startDate),
    to: parseDateInput(endDate),
  }));

  // Whenever the popover opens, start from the currently committed dates.
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftRange({
        from: parseDateInput(startDate),
        to: parseDateInput(endDate),
      });
    }
    setOpen(nextOpen);
  };

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

  const canApply = Boolean(draftRange.from && draftRange.to);

  const handleSelect = (selected: DateRange | undefined) => {
    setDraftRange(selected ?? { from: undefined });
  };

  const handleApply = () => {
    if (!draftRange.from || !draftRange.to) return;
    onStartDateChange(toDateInputValueFromDate(draftRange.from));
    onEndDateChange(toDateInputValueFromDate(draftRange.to));
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          selected={draftRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
        <div className="flex items-center justify-end gap-2 border-t p-2">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={!canApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
