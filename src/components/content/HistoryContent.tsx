"use client";

import { useState, useMemo } from "react";
import { useJournalStore } from "@/store/journalStore";
import { useChatStore } from "@/store/chatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function HistoryContent() {
  const schedules = useJournalStore((s) => s.schedules);
  const dailyNotes = useJournalStore((s) => s.dailyNotes);
  const messages = useChatStore((s) => s.messages);
  
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const totalSchedules = schedules.length;
  const completedSchedules = schedules.filter((s) => s.completed).length;
  const completionRate = totalSchedules > 0 
    ? Math.round((completedSchedules / totalSchedules) * 100) 
    : 0;
  const totalNotes = dailyNotes.length;
  const totalChats = messages.filter((m) => m.role === "user").length;
  
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const cells: { day: number | null; date: string | null; count: number }[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, date: null, count: 0 });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateFromParts(year, month, day);
      const scheduleCount = schedules.filter((s) => s.date === dateStr).length;
      const noteCount = dailyNotes.filter((n) => n.date === dateStr).length;
      const chatCount = messages.filter((m) => {
        if (m.role !== "user") return false;
        const msgDate = new Date(m.timestamp);
        return formatDate(msgDate) === dateStr;
      }).length;
      
      cells.push({
        day,
        date: dateStr,
        count: scheduleCount + noteCount + chatCount,
      });
    }
    
    return cells;
  }, [schedules, dailyNotes, messages, year, month]);
  
  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const getHeatColor = (count: number): string => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-neo-green/30";
    if (count === 2) return "bg-neo-green/50";
    if (count <= 4) return "bg-neo-green/70";
    return "bg-neo-green";
  };
  
  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <Card className="neo-card">
        <CardHeader className="border-b-4 border-foreground bg-neo-green rounded-t-lg">
          <CardTitle className="text-xl font-black">历史记录</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 border-2 border-foreground rounded-lg bg-card neo-shadow-sm">
              <p className="text-2xl font-black">{totalSchedules}</p>
              <p className="text-xs text-muted-foreground">总日程</p>
            </div>
            <div className="text-center p-3 border-2 border-foreground rounded-lg bg-card neo-shadow-sm">
              <p className="text-2xl font-black">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">完成率</p>
            </div>
            <div className="text-center p-3 border-2 border-foreground rounded-lg bg-card neo-shadow-sm">
              <p className="text-2xl font-black">{totalNotes}</p>
              <p className="text-xs text-muted-foreground">随手记</p>
            </div>
            <div className="text-center p-3 border-2 border-foreground rounded-lg bg-card neo-shadow-sm">
              <p className="text-2xl font-black">{totalChats}</p>
              <p className="text-xs text-muted-foreground">自我对话</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 日历热力图 */}
      <Card className="neo-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">活动日历</CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="neo-btn p-1.5 rounded-lg bg-card hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold min-w-[100px] text-center">
                {year}年{month + 1}月
              </span>
              <button
                onClick={goToNextMonth}
                className="neo-btn p-1.5 rounded-lg bg-card hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-foreground rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-muted">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-muted-foreground font-medium py-2 border-b border-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarData.map((cell, index) => (
                <div
                  key={index}
                  className={`h-9 flex items-center justify-center text-xs font-medium border-r border-b border-foreground/20 last:border-r-0 ${
                    cell.day === null ? "bg-transparent" : getHeatColor(cell.count)
                  }`}
                  title={cell.date ? `${cell.date}: ${cell.count} 条记录` : ""}
                >
                  {cell.day}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded border border-foreground bg-muted" />
              <div className="w-3 h-3 rounded border border-foreground bg-neo-green/30" />
              <div className="w-3 h-3 rounded border border-foreground bg-neo-green/50" />
              <div className="w-3 h-3 rounded border border-foreground bg-neo-green/70" />
              <div className="w-3 h-3 rounded border border-foreground bg-neo-green" />
            </div>
            <span>多</span>
          </div>
        </CardContent>
      </Card>
      
      {/* 高频词汇 */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">高频词汇</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyNotes.length < 5 ? (
            <p className="text-muted-foreground text-center py-4">
              记录不够，暂无法分析
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {/* 这里可以添加词频分析 */}
              <span className="px-3 py-1 rounded-full border-2 border-foreground bg-neo-yellow text-sm font-medium">
                示例词汇
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 月度总结 */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">本月总结</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            继续记录，月底将为你生成专属总结
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
