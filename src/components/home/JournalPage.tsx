"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useJournalStore } from "@/store/journalStore";
import type { MoodRecord } from "@/types/mood";
import { MOOD_EMOJIS } from "@/types/mood";
import { sortSchedules } from "@/types/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Camera, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadImageFromBlobUrl } from "@/lib/supabase";

interface JournalPageProps {
  date: string; // YYYY-MM-DD
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatDateHeader(dateStr: string): { year: string; monthDay: string; weekday: string } {
  const date = new Date(dateStr + "T00:00:00");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdayIdx = date.getDay();
  
  return {
    year: `${year}年`,
    monthDay: `${month}月${day}日`,
    weekday: `星期${WEEKDAYS[weekdayIdx]}`,
  };
}

function MoodRecordCard({ record, onDelete }: { record: MoodRecord; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex gap-3 rounded-lg bg-amber-50/30 p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
        <Image
          src={record.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="80px"
          unoptimized
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{record.emoji}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(record.timestamp).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {record.note && (
          <p className="text-sm text-muted-foreground">{record.note}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(record.id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function JournalPage({ date }: JournalPageProps) {
  const { year, monthDay, weekday } = formatDateHeader(date);
  
  // Store
  const schedules = useJournalStore((s) => s.schedules.filter((t) => t.date === date));
  const sortedSchedules = sortSchedules(schedules);
  
  const records = useJournalStore((s) => s.records.filter((r) => {
    const recordDate = new Date(r.timestamp).toISOString().split("T")[0];
    return recordDate === date;
  }));
  
  const dailyNote = useJournalStore((s) => s.dailyNotes.find((n) => n.date === date));
  
  const addSchedule = useJournalStore((s) => s.addSchedule);
  const toggleSchedule = useJournalStore((s) => s.toggleSchedule);
  const deleteSchedule = useJournalStore((s) => s.deleteSchedule);
  const addRecord = useJournalStore((s) => s.addRecord);
  const deleteRecord = useJournalStore((s) => s.deleteRecord);
  const updateDailyNote = useJournalStore((s) => s.updateDailyNote);
  
  // Schedule state
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [scheduleContent, setScheduleContent] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [hasEndTime, setHasEndTime] = useState(false);
  
  // Mood record state
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [moodNote, setMoodNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Daily note state
  const [noteContent, setNoteContent] = useState(dailyNote?.content || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update note content when date changes
  useEffect(() => {
    setNoteContent(dailyNote?.content || "");
  }, [date, dailyNote?.content]);
  
  // Debounced save for note
  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteContent(value);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      updateDailyNote(date, value);
    }, 500);
  }, [date, updateDailyNote]);
  
  // Schedule handlers
  const handleAddSchedule = useCallback(() => {
    if (scheduleContent.trim()) {
      addSchedule(
        date,
        scheduleContent.trim(),
        scheduleStartTime || undefined,
        hasEndTime ? scheduleEndTime || undefined : undefined
      );
      setScheduleContent("");
      setScheduleStartTime("");
      setScheduleEndTime("");
      setHasEndTime(false);
      setShowScheduleInput(false);
    }
  }, [date, scheduleContent, scheduleStartTime, scheduleEndTime, hasEndTime, addSchedule]);
  
  const handleScheduleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSchedule();
    } else if (e.key === "Escape") {
      setShowScheduleInput(false);
      setScheduleContent("");
      setScheduleStartTime("");
      setScheduleEndTime("");
      setHasEndTime(false);
    }
  }, [handleAddSchedule]);
  
  // Mood record handlers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
    }
  }, []);
  
  const handleSaveMood = useCallback(async () => {
    if (selectedImage && selectedEmoji) {
      setIsUploading(true);
      
      try {
        // 尝试上传到云存储
        let finalImageUrl = selectedImage;
        
        // 如果是 blob URL，尝试上传到 Supabase Storage
        if (selectedImage.startsWith("blob:")) {
          const uploadedUrl = await uploadImageFromBlobUrl(selectedImage);
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            // 清理 blob URL
            URL.revokeObjectURL(selectedImage);
          }
          // 如果上传失败，继续使用 blob URL（本地模式）
        }
        
        // 使用当前页面日期而非 Date.now()
        const pageDate = new Date(date + "T12:00:00"); // 使用中午12点作为默认时间
        await addRecord({
          imageUrl: finalImageUrl,
          timestamp: pageDate.getTime(),
          emoji: selectedEmoji,
          note: moodNote.trim() || undefined,
        });
        
        setSelectedImage(null);
        setSelectedFile(null);
        setSelectedEmoji("");
        setMoodNote("");
        setShowMoodInput(false);
      } catch (error) {
        console.error("保存心情记录失败:", error);
      } finally {
        setIsUploading(false);
      }
    }
  }, [selectedImage, selectedEmoji, moodNote, date, addRecord]);
  
  const handleCancelMood = useCallback(() => {
    if (selectedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setSelectedFile(null);
    setSelectedEmoji("");
    setMoodNote("");
    setShowMoodInput(false);
  }, [selectedImage]);
  
  return (
    <div className="flex h-full flex-col space-y-4 p-4 pb-6">
      {/* 日期标题 */}
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-1">
          <h2 className="text-2xl font-semibold">{year}</h2>
          <h2 className="text-3xl font-bold">{monthDay}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{weekday}</p>
      </div>
      
      {/* 日程 */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📅 日程</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedSchedules.length === 0 && !showScheduleInput && (
            <p className="text-sm text-muted-foreground py-2">暂无日程安排</p>
          )}
          {sortedSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="group flex items-start gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={schedule.completed}
                onCheckedChange={() => toggleSchedule(schedule.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                {schedule.startTime && (
                  <span className="text-xs text-muted-foreground mr-2">
                    {schedule.startTime}{schedule.endTime ? `-${schedule.endTime}` : ''}
                  </span>
                )}
                <span
                  className={cn(
                    "text-sm",
                    schedule.completed && "line-through text-muted-foreground"
                  )}
                >
                  {schedule.content}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteSchedule(schedule.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {showScheduleInput && (
            <div className="space-y-2 rounded-md border p-3 bg-muted/20">
              <Input
                value={scheduleContent}
                onChange={(e) => setScheduleContent(e.target.value)}
                onKeyDown={handleScheduleKeyPress}
                placeholder="输入日程内容..."
                className="h-9"
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  className="h-9"
                  placeholder="开始时间"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={hasEndTime}
                    onCheckedChange={(checked) => setHasEndTime(!!checked)}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">结束</span>
                </div>
                {hasEndTime && (
                  <Input
                    type="time"
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    className="h-9"
                    placeholder="结束时间"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSchedule}>
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowScheduleInput(false);
                    setScheduleContent("");
                    setScheduleStartTime("");
                    setScheduleEndTime("");
                    setHasEndTime(false);
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
          
          {!showScheduleInput && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setShowScheduleInput(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              添加日程
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* 心情记录 */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💭 今日心情</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 && (
            <div className="space-y-3 mb-3">
              {records.map((record) => (
                <MoodRecordCard key={record.id} record={record} onDelete={deleteRecord} />
              ))}
            </div>
          )}
          
          {showMoodInput ? (
            <div className="space-y-3 rounded-md border border-dashed p-3">
              {/* 图片上传 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              {!selectedImage ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  选择照片
                </Button>
              ) : (
                <div className="relative w-full h-32">
                  <Image
                    src={selectedImage}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      if (selectedImage.startsWith("blob:")) {
                        URL.revokeObjectURL(selectedImage);
                      }
                      setSelectedImage(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Emoji 选择 */}
              <div className="flex gap-2 justify-center">
                {Object.entries(MOOD_EMOJIS).map(([key, emoji]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={cn(
                      "text-2xl p-2 rounded-lg transition-all",
                      selectedEmoji === emoji
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "hover:bg-muted hover:scale-105"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* 备注 */}
              <Input
                placeholder="添加一句话..."
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
              
              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveMood}
                  disabled={!selectedImage || !selectedEmoji || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    "保存心情"
                  )}
                </Button>
                <Button variant="ghost" onClick={handleCancelMood} disabled={isUploading}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            records.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  今天还没有记录心情
                </p>
                <Button variant="outline" onClick={() => setShowMoodInput(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  记录心情
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setShowMoodInput(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                继续记录
              </Button>
            )
          )}
        </CardContent>
      </Card>
      
      {/* 自由笔记 */}
      <Card className="flex-1 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">✎ 随手记</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <Textarea
            value={noteContent}
            onChange={handleNoteChange}
            placeholder="写下今天的想法..."
            className="min-h-[120px] resize-none border-none shadow-none focus-visible:ring-0 bg-transparent"
          />
        </CardContent>
      </Card>
    </div>
  );
}
