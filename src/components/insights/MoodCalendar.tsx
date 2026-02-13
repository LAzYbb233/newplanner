"use client";

import { useMemo } from "react";
import type { MoodRecord } from "@/types/mood";
import { cn } from "@/lib/utils";

// Emoji 到颜色的映射
const emojiToDotColor: Record<string, string> = {
  "😊": "bg-amber-500",
  "😌": "bg-sky-500",
  "😢": "bg-violet-500",
  "😰": "bg-slate-500",
  "💪": "bg-orange-500",
};

function getDominantEmoji(records: MoodRecord[]): string {
  const counts: Record<string, number> = {};
  let max = 0;
  let dominant = "😊";
  for (const r of records) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
    if (counts[r.emoji]! > max) {
      max = counts[r.emoji]!;
      dominant = r.emoji;
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
              <div className="flex items-center justify-center h-4 w-4 text-xs">
                {getDominantEmoji(recordsByDay[d])}
              </div>
            ) : (
              <div className="h-4 w-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
