"use client";

import { useState, useMemo } from "react";
import { useJournalStore } from "@/store/journalStore";
import { useChatStore } from "@/store/chatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodCalendar } from "@/components/insights/MoodCalendar";
import { ChevronLeft, ChevronRight, TrendingUp, Brain, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const records = useJournalStore((s) => s.records);
  const schedules = useJournalStore((s) => s.schedules);
  const todos = useJournalStore((s) => s.todos);
  const messages = useChatStore((s) => s.messages);
  
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const totalRecords = records.length;
  const totalSchedules = schedules.length;
  const completedSchedules = schedules.filter((s) => s.completed).length;
  const completionRate = totalSchedules > 0 
    ? Math.round((completedSchedules / totalSchedules) * 100) 
    : 0;
  
  const todoCompletionRate = todos.length > 0
    ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100)
    : 0;
  
  const emotionStats = useMemo(() => {
    const assistantMessages = messages.filter(
      m => m.role === "assistant" && m.emotionType && m.emotionScore
    );
    
    if (assistantMessages.length === 0) {
      return null;
    }
    
    const totalScore = assistantMessages.reduce(
      (sum, m) => sum + (m.emotionScore || 0), 
      0
    );
    const avgScore = Math.round((totalScore / assistantMessages.length) * 10) / 10;
    
    const emotionCounts: Record<string, number> = {};
    assistantMessages.forEach(m => {
      if (m.emotionType) {
        emotionCounts[m.emotionType] = (emotionCounts[m.emotionType] || 0) + 1;
      }
    });
    
    const sortedEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1]);
    
    const topEmotion = sortedEmotions[0];
    
    const recentMessages = assistantMessages.slice(-7);
    const recentAvg = recentMessages.length > 0
      ? Math.round((recentMessages.reduce((sum, m) => sum + (m.emotionScore || 0), 0) / recentMessages.length) * 10) / 10
      : 0;
    
    const trend = recentAvg > avgScore ? "上升" : recentAvg < avgScore ? "下降" : "稳定";
    
    return {
      totalAnalyses: assistantMessages.length,
      avgScore,
      topEmotion: topEmotion ? { type: topEmotion[0], count: topEmotion[1] } : null,
      recentAvg,
      trend,
      emotionDistribution: sortedEmotions.slice(0, 5),
    };
  }, [messages]);

  return (
    <div className="px-4 py-4 mx-auto max-w-2xl lg:py-8">
      <h1 className="mb-4 text-xl font-black">数据洞察</h1>
      
      {/* 主要统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="neo-card flex overflow-hidden">
          <div className="w-16 bg-neo-purple flex items-center justify-center">
            <span className="text-2xl">💭</span>
          </div>
          <CardContent className="flex-1 py-4 text-center">
            <p className="text-2xl font-black">{totalRecords}</p>
            <p className="text-xs text-muted-foreground">心情记录</p>
          </CardContent>
        </Card>
        <Card className="neo-card flex overflow-hidden">
          <div className="w-16 bg-neo-green flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <CardContent className="flex-1 py-4 text-center">
            <p className="text-2xl font-black">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">日程完成率</p>
          </CardContent>
        </Card>
      </div>
      
      {/* 待办和 AI 分析统计 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="neo-card flex overflow-hidden">
          <div className="w-16 bg-neo-pink flex items-center justify-center">
            <CheckSquare className="h-6 w-6" />
          </div>
          <CardContent className="flex-1 py-4 text-center">
            <p className="text-2xl font-black">{todoCompletionRate}%</p>
            <p className="text-xs text-muted-foreground">待办完成率</p>
          </CardContent>
        </Card>
        <Card className="neo-card flex overflow-hidden">
          <div className="w-16 bg-neo-blue flex items-center justify-center">
            <Brain className="h-6 w-6" />
          </div>
          <CardContent className="flex-1 py-4 text-center">
            <p className="text-2xl font-black">{emotionStats?.totalAnalyses || 0}</p>
            <p className="text-xs text-muted-foreground">AI 情绪分析</p>
          </CardContent>
        </Card>
      </div>
      
      {/* AI 情绪分析洞察 */}
      {emotionStats && (
        <Card className="neo-card mb-4">
          <CardHeader className="border-b-4 border-foreground bg-neo-yellow rounded-t-lg">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              情绪趋势分析
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black">{emotionStats.avgScore}</p>
                <p className="text-xs text-muted-foreground">平均情绪分</p>
              </div>
              <div>
                <p className="text-2xl font-black">{emotionStats.recentAvg}</p>
                <p className="text-xs text-muted-foreground">近期情绪分</p>
              </div>
              <div>
                <p className="text-2xl font-black">
                  {emotionStats.trend === "上升" && "↗️"}
                  {emotionStats.trend === "下降" && "↘️"}
                  {emotionStats.trend === "稳定" && "→"}
                </p>
                <p className="text-xs text-muted-foreground">趋势</p>
              </div>
            </div>
            
            {emotionStats.topEmotion && (
              <div className="pt-4 border-t-2 border-dashed border-foreground/20">
                <p className="text-sm font-medium mb-2">情绪分布</p>
                <div className="flex flex-wrap gap-2">
                  {emotionStats.emotionDistribution.map(([emotion, count]) => (
                    <span
                      key={emotion}
                      className="px-3 py-1 rounded-full border-2 border-foreground bg-card text-sm font-medium"
                    >
                      {emotion} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* 情绪日历 */}
      <Card className="neo-card">
        <CardHeader className="border-b-4 border-foreground bg-neo-purple rounded-t-lg">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCalendarDate(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1)
                )
              }
              className="neo-btn h-8 w-8 bg-card"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg font-black">
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
              className="neo-btn h-8 w-8 bg-card"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <MoodCalendar records={records} year={year} month={month} />
        </CardContent>
      </Card>
    </div>
  );
}
