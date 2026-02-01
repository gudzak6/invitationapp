"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DropdownProps } from "react-day-picker";
import type { ChangeEvent, ChangeEventHandler } from "react";
import { Children, isValidElement, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TimeWindow = { start: string; end: string };

export type SlotSelection = {
  date: string;
  time: string;
  label: string;
};

type Props = {
  timezone?: string;
  durationMins?: number;
  timeWindows?: TimeWindow[];
  onSelect: (value: SlotSelection) => void;
  initialSelection?: SlotSelection | null;
};

function parseHHMM(value: string) {
  const [h, m] = value.split(":").map((x) => Number(x));
  return { h, m };
}

function addMinutes(date: Date, mins: number) {
  return new Date(date.getTime() + mins * 60_000);
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatISOTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatTimeLabel(date: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit"
  });
  return fmt.format(date).replace(" ", "");
}

export default function DateTimeSlotPicker({
  timezone = "America/New_York",
  durationMins = 60,
  timeWindows = [{ start: "12:00", end: "23:59" }],
  onSelect,
  initialSelection = null
}: Props) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedSlotISO, setSelectedSlotISO] = useState<string | null>(null);

  useEffect(() => {
    if (!initialSelection) return;
    const [year, monthValue, day] = initialSelection.date
      .split("-")
      .map((x) => Number(x));
    const [hour, minute] = initialSelection.time
      .split(":")
      .map((x) => Number(x));
    const initialDate = new Date(year, monthValue - 1, day, hour, minute, 0, 0);
    setDate(initialDate);
    setMonth(initialDate);
    setSelectedSlotISO(initialDate.toISOString());
    onSelect(initialSelection);
  }, [initialSelection, onSelect]);

  const handleCalendarChange = (
    value: string | number,
    event: ChangeEventHandler<HTMLSelectElement>
  ) => {
    const newEvent = {
      target: {
        value: String(value)
      }
    } as ChangeEvent<HTMLSelectElement>;
    event(newEvent);
  };

  const slots = useMemo(() => {
    if (!date) return [];
    const slotList: { start: Date; startISO: string }[] = [];

    for (const w of timeWindows) {
      const { h: sh, m: sm } = parseHHMM(w.start);
      const { h: eh, m: em } = parseHHMM(w.end);

      const start = new Date(date);
      start.setHours(sh, sm, 0, 0);

      const endBoundary = new Date(date);
      endBoundary.setHours(eh, em, 0, 0);

      let cursor = start;
      while (addMinutes(cursor, durationMins) <= endBoundary) {
        const slotStart = cursor;
        slotList.push({
          start: slotStart,
          startISO: slotStart.toISOString()
        });
        cursor = addMinutes(cursor, durationMins);
      }
    }

    return slotList;
  }, [date, timeWindows, durationMins]);

  const handleSelectTime = (slot: { start: Date; startISO: string }) => {
    if (!date) return;
    setSelectedSlotISO(slot.startISO);
    onSelect({
      date: formatISODate(slot.start),
      time: formatISOTime(slot.start),
      label: `${format(date, "PPP")} ${formatTimeLabel(slot.start, timezone)}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-[0.3em] text-ink-600">
        Date + time
      </div>
      <div className="glass-panel p-4">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <CalendarIcon className="h-4 w-4" />
              <span>{date ? format(date, "PPP") : "Pick a date"}</span>
            </div>
            <div className="rounded-2xl border border-ink-900/10 bg-white/70 p-2">
              <Calendar
                captionLayout="dropdown"
                components={{
                  Dropdown: (props: DropdownProps) => {
                    const options = Children.toArray(props.children).filter(
                      (
                        child
                      ): child is React.ReactElement<
                        React.OptionHTMLAttributes<HTMLOptionElement>
                      > => isValidElement(child) && child.type === "option"
                    );

                    return (
                      <Select
                        onValueChange={(value) => {
                          if (props.onChange) {
                            handleCalendarChange(value, props.onChange);
                          }
                        }}
                        value={String(props.value)}
                      >
                        <SelectTrigger className="first:flex-1 last:shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem
                              disabled={option.props.disabled}
                              key={String(option.props.value)}
                              value={String(option.props.value)}
                            >
                              {option.props.children}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }
                }}
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(value) => {
                  setDate(value ?? undefined);
                  setSelectedSlotISO(null);
                }}
                selected={date}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-ink-500">
              Available times
            </div>
            <div className="grid grid-cols-2 gap-2">
              {slots.length === 0 && (
                <div className="col-span-2 rounded-2xl border border-ink-900/10 bg-white/70 px-4 py-3 text-xs text-ink-600">
                  Select a date to see available times.
                </div>
              )}
              {slots.map((slot) => {
                const label = formatTimeLabel(slot.start, timezone);
                const active = selectedSlotISO === slot.startISO;
                return (
                  <button
                    key={slot.startISO}
                    type="button"
                    onClick={() => handleSelectTime(slot)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "border-ink-900 bg-ink-900 text-white"
                        : "border-ink-900/15 bg-white text-ink-900"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
