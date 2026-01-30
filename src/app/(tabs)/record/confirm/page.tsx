"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMoodStore } from "@/store/moodStore";
import {
  moodUIOptionToType,
  MOOD_UI_OPTIONS,
  type MoodUIOption,
} from "@/types/mood";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const MOCK_LOCATIONS = ["Home", "Coffee Shop", "Work", "Outdoors"];
const MOCK_TAGS = ["Coffee", "Sunset", "Cat", "Morning", "Reading"];
const MOCK_SUMMARY = "看起来是一个惬意的下午。";

export default function ConfirmPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const url = sessionStorage.getItem("moodlens-pending-image");
    if (url) setImageUrl(url);
    else router.replace("/record");
  }, [router]);

  const addRecord = useMoodStore((s) => s.addRecord);

  const [dateTime, setDateTime] = useState(() => Date.now());
  const [location, setLocation] = useState("Home");
  const [tags, setTags] = useState<string[]>(MOCK_TAGS.slice(0, 3));
  const [mood, setMood] = useState<MoodUIOption>("Happy");
  const [moodIntensity, setMoodIntensity] = useState([7]);
  const [aiSummary, setAiSummary] = useState(MOCK_SUMMARY);
  const [userNote, setUserNote] = useState("");

  const handleSave = useCallback(() => {
    addRecord({
      imageUrl: imageUrl || "https://placehold.co/400x300",
      timestamp: dateTime,
      location,
      tags,
      mood: moodUIOptionToType(mood),
      moodIntensity: moodIntensity[0] ?? 7,
      aiSummary,
      userNote: userNote || undefined,
    });
    sessionStorage.removeItem("moodlens-pending-image");
    if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    router.replace("/");
  }, [
    addRecord,
    imageUrl,
    dateTime,
    location,
    tags,
    mood,
    moodIntensity,
    aiSummary,
    userNote,
    router,
  ]);

  const dateTimeStr = useMemo(() => {
    const d = new Date(dateTime);
    return d.toISOString().slice(0, 16);
  }, [dateTime]);

  const updateDateTime = (v: string) => {
    const t = new Date(v).getTime();
    if (!isNaN(t)) setDateTime(t);
  };

  if (!imageUrl) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4 pb-24">
      <Card className="overflow-hidden">
        <div className="relative aspect-video w-full bg-muted">
          <Image
            src={imageUrl}
            alt="Upload"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium">日期与时间</label>
            <input
              type="datetime-local"
              value={dateTimeStr}
              onChange={(e) => updateDateTime(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">地点</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {MOCK_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">检测标签</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {MOCK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    )
                  }
                  className={cn(
                    "rounded-full px-3 py-1 text-sm",
                    tags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">情绪</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {MOOD_UI_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm",
                    mood === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">情绪强度 (1-10)</label>
            <Slider
              value={moodIntensity}
              onValueChange={setMoodIntensity}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {moodIntensity[0] ?? 7}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">AI 摘要</label>
            <textarea
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">补充日记（选填）</label>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="写下此刻的想法..."
              rows={2}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave}>
        保存
      </Button>
    </div>
  );
}
