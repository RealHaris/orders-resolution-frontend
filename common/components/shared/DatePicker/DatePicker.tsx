"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  parseDateInput,
  toDateInputValueFromDate,
} from "@/common/utils/date";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

/**
 * Date picker that stores values as `YYYY-MM-DD` strings.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseDateInput(value) : undefined;

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
        {value || placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              return;
            }
            onChange(toDateInputValueFromDate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
