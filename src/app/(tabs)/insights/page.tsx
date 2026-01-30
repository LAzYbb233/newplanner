"use client";

import { useState } from "react";
import { useMoodStore } from "@/store/moodStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MoodCalendar } from "@/components/insights/MoodCalendar";
import { MoodTrendChart } from "@/components/insights/MoodTrendChart";
import { ScenePieChart } from "@/components/insights/ScenePieChart";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const records = useMoodStore((s) => s.records);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-semibold">数据洞察</h1>
      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">日历</TabsTrigger>
          <TabsTrigger value="trend">趋势</TabsTrigger>
          <TabsTrigger value="scene">场景</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
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
                <span className="font-medium">
                  {year}年{month + 1}月
                </span>
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
              <MoodCalendar records={records} year={year} month={month} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trend" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-sm text-muted-foreground">
                情绪能量值 (1-10) 随日期变化
              </p>
              <MoodTrendChart records={records} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scene" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-sm text-muted-foreground">
                记录场景分布
              </p>
              <ScenePieChart records={records} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
