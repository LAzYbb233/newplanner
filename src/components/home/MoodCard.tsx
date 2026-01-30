"use client";

import Image from "next/image";
import type { MoodRecord, MoodType } from "@/types/mood";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const moodToBg: Record<MoodType, string> = {
  Happy: "bg-amber-50 dark:bg-amber-950/30",
  Calm: "bg-sky-50 dark:bg-sky-950/30",
  Anxious: "bg-slate-100 dark:bg-slate-800/50",
  Sad: "bg-violet-50 dark:bg-violet-950/30",
  Energetic: "bg-orange-50 dark:bg-orange-950/30",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return `今天 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  return d.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MoodCard({ record }: { record: MoodRecord }) {
  return (
    <div className="relative flex gap-4 py-3">
      {/* 时间轴竖线 */}
      <div className="absolute left-[18px] top-10 bottom-3 w-px bg-border" />
      <div className="relative z-10 flex h-4 w-4 shrink-0 rounded-full bg-primary mt-1.5" />
      <div className="min-w-0 flex-1 pl-2">
        <Card className={cn("overflow-hidden", moodToBg[record.mood])}>
          <CardContent className="p-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
              <Image
                src={record.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
                unoptimized
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">
                {formatTime(record.timestamp)}
                {record.location && ` · ${record.location}`}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {record.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-medium text-foreground">{record.mood}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {record.aiSummary}
              </p>
              {record.moodIntensity != null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  情绪强度: {record.moodIntensity}/10
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
