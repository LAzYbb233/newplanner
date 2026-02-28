"use client";

import { useState, useMemo } from "react";
import { useJournalStore } from "@/store/journalStore";
import { useChatStore } from "@/store/chatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

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
  
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const scheduleCount = schedules.filter((s) => s.date === dateStr).length;
      const noteCount = dailyNotes.filter((n) => n.date === dateStr).length;
      
      days.push({
        date: dateStr,
        count: scheduleCount + noteCount,
      });
    }
    
    return days;
  }, [schedules, dailyNotes]);
  
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
      
      {/* 热力图 */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">30天活动热力图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1">
            {heatmapData.map((day) => (
              <div
                key={day.date}
                className={`aspect-square rounded border-2 border-foreground ${getHeatColor(day.count)}`}
                title={`${day.date}: ${day.count} 条记录`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
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
