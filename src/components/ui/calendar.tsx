"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-ink-900",
        nav: "space-x-1 flex items-center",
        nav_button:
          "h-8 w-8 rounded-full border border-ink-900/10 bg-white text-ink-900 hover:bg-sand-50",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "w-9 font-medium text-xs text-ink-500 flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: "relative w-9 h-9 text-center text-sm",
        day: "h-9 w-9 rounded-full hover:bg-sand-50",
        day_selected: "bg-ink-900 text-white hover:bg-ink-900",
        day_today: "border border-ink-900/20",
        day_outside: "text-ink-500/50",
        day_disabled: "text-ink-500/50 opacity-50",
        ...classNames
      }}
      {...props}
    />
  );
}
