"use client";

import { useState } from "react";
import { useJournalStore } from "@/store/journalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodCalendar } from "@/components/insights/MoodCalendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const records = useJournalStore((s) => s.records);
  const schedules = useJournalStore((s) => s.schedules);
  
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  // 统计数据
  const totalRecords = records.length;
  const totalSchedules = schedules.length;
  const completedSchedules = schedules.filter((s) => s.completed).length;
  const completionRate = totalSchedules > 0 
    ? Math.round((completedSchedules / totalSchedules) * 100) 
    : 0;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-semibold">数据洞察</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{totalRecords}</p>
            <p className="text-xs text-muted-foreground">心情记录</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">日程完成率</p>
          </CardContent>
        </Card>
      </div>
      
      {/* 情绪日历 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCalendarDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1)
                )
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-base">
              {year}年{month + 1}月
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCalendarDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1)
                )
              }
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MoodCalendar records={records} year={year} month={month} />
        </CardContent>
      </Card>
    </div>
  );
}
