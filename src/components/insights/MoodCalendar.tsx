"use client";

import { useMemo } from "react";
import type { MoodRecord, MoodType } from "@/types/mood";
import { cn } from "@/lib/utils";

const moodToDotColor: Record<MoodType, string> = {
  Happy: "bg-amber-500",
  Calm: "bg-sky-500",
  Anxious: "bg-slate-500",
  Sad: "bg-violet-500",
  Energetic: "bg-orange-500",
};

function getDominantMood(records: MoodRecord[]): MoodType {
  const counts: Partial<Record<MoodType, number>> = {};
  let max = 0;
  let dominant: MoodType = "Calm";
  for (const r of records) {
    counts[r.mood] = (counts[r.mood] ?? 0) + 1;
    if (counts[r.mood]! > max) {
      max = counts[r.mood]!;
      dominant = r.mood;
    }
  }
  return dominant;
}

export function MoodCalendar({
  records,
  year,
  month,
}: {
  records: MoodRecord[];
  year: number;
  month: number;
}) {
  const { days, recordsByDay } = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    const recordsByDay: Record<number, MoodRecord[]> = {};
    for (const r of records) {
      const d = new Date(r.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!recordsByDay[day]) recordsByDay[day] = [];
        recordsByDay[day].push(r);
      }
    }
    return { days, recordsByDay };
  }, [records, year, month]);

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="w-full">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekDays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                d === null
                  ? "invisible"
                  : "text-foreground"
              )}
            >
              {d ?? ""}
            </span>
            {d != null && recordsByDay[d]?.length ? (
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  moodToDotColor[getDominantMood(recordsByDay[d])]
                )}
              />
            ) : (
              <div className="h-2 w-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
