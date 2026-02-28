"use client";

import { useState, useCallback, useEffect } from "react";
import { useJournalStore } from "@/store/journalStore";
import { sortSchedules } from "@/types/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleContentProps {
  showAddForm: boolean;
  onCloseAddForm: () => void;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function formatDateHeader(dateStr: string): { year: number; month: number; day: number; weekday: string } {
  const date = new Date(dateStr + "T00:00:00");
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: `星期${WEEKDAYS[date.getDay()]}`,
  };
}

export function ScheduleContent({ showAddForm, onCloseAddForm }: ScheduleContentProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const dateKey = formatDate(currentDate);
  const { year, month, day, weekday } = formatDateHeader(dateKey);
  
  const today = new Date();
  const isToday = formatDate(currentDate) === formatDate(today);
  
  const schedules = useJournalStore((s) => s.schedules.filter((t) => t.date === dateKey));
  const sortedSchedules = sortSchedules(schedules);
  const addSchedule = useJournalStore((s) => s.addSchedule);
  const toggleSchedule = useJournalStore((s) => s.toggleSchedule);
  const deleteSchedule = useJournalStore((s) => s.deleteSchedule);
  
  const [showInput, setShowInput] = useState(false);
  const [content, setContent] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hasEndTime, setHasEndTime] = useState(false);
  
  useEffect(() => {
    if (showAddForm) {
      setShowInput(true);
    }
  }, [showAddForm]);
  
  const handleAdd = useCallback(() => {
    if (content.trim()) {
      addSchedule(
        dateKey,
        content.trim(),
        startTime || undefined,
        hasEndTime ? endTime || undefined : undefined
      );
      setContent("");
      setStartTime("");
      setEndTime("");
      setHasEndTime(false);
      setShowInput(false);
      onCloseAddForm();
    }
  }, [dateKey, content, startTime, endTime, hasEndTime, addSchedule, onCloseAddForm]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setShowInput(false);
      setContent("");
      onCloseAddForm();
    }
  }, [handleAdd, onCloseAddForm]);
  
  return (
    <div className="space-y-4">
      {/* 日期选择器 */}
      <Card className="neo-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate((d) => addDays(d, -1))}
              className="neo-btn p-2 rounded-lg bg-card"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-black">
                {month}月{day}日
              </div>
              <div className="text-sm text-muted-foreground">
                {year}年 · {weekday}
              </div>
            </div>
            
            <button
              onClick={() => setCurrentDate((d) => addDays(d, 1))}
              className="neo-btn p-2 rounded-lg bg-card"
              disabled={currentDate >= today}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          {!isToday && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-sm font-medium text-muted-foreground hover:text-foreground underline"
              >
                回到今天
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 日程安排 */}
      <Card className="neo-card">
        <CardHeader className="border-b-4 border-foreground bg-neo-yellow rounded-t-lg">
          <CardTitle className="text-xl font-black">日程安排</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <h3 className="font-bold text-lg">今日日程</h3>
          
          {sortedSchedules.length === 0 && !showInput && (
            <p className="text-muted-foreground py-4">
              今天还没有安排，去添加一些吧！
            </p>
          )}
          
          {sortedSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="group flex items-start gap-3 p-3 rounded-lg border-2 border-foreground bg-card neo-shadow-sm"
            >
              <Checkbox
                checked={schedule.completed}
                onCheckedChange={() => toggleSchedule(schedule.id)}
                className="mt-0.5 h-5 w-5 border-2 border-foreground"
              />
              <div className="flex-1">
                {schedule.startTime && (
                  <span className="text-xs font-medium text-muted-foreground mr-2">
                    {schedule.startTime}{schedule.endTime ? `-${schedule.endTime}` : ""}
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium",
                    schedule.completed && "line-through text-muted-foreground"
                  )}
                >
                  {schedule.content}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteSchedule(schedule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {showInput && (
            <div className="space-y-3 p-4 rounded-lg border-4 border-foreground bg-muted/50">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="输入日程内容..."
                className="neo-input"
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="neo-input flex-1"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={hasEndTime}
                    onCheckedChange={(checked) => setHasEndTime(!!checked)}
                    className="border-2 border-foreground"
                  />
                  <span className="text-sm font-medium">结束</span>
                </div>
                {hasEndTime && (
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="neo-input flex-1"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="neo-btn px-4 py-2 rounded-lg bg-neo-green">
                  保存
                </button>
                <button
                  onClick={() => {
                    setShowInput(false);
                    setContent("");
                    onCloseAddForm();
                  }}
                  className="neo-btn px-4 py-2 rounded-lg bg-card"
                >
                  取消
                </button>
              </div>
            </div>
          )}
          
          {!showInput && (
            <button
              onClick={() => setShowInput(true)}
              className="neo-btn w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-card"
            >
              <Plus className="h-5 w-5" />
              添加日程
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
