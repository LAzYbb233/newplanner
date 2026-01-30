"use client";

import { useMoodStore } from "@/store/moodStore";
import { MoodCard } from "@/components/home/MoodCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function HomePage() {
  const records = useMoodStore((s) => s.records);
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  if (sorted.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-muted-foreground">
          还没有任何记录，拍一张照片开始记录心情吧
        </p>
        <Button asChild>
          <Link href="/record" className="inline-flex items-center gap-2">
            <Camera className="h-4 w-4" />
            去记录
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-0 px-4 py-4">
      {sorted.map((record) => (
        <MoodCard key={record.id} record={record} />
      ))}
    </div>
  );
}
