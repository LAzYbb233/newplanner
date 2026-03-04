"use client";

import { useState, useMemo } from "react";
import { useJournalStore } from "@/store/journalStore";
import { useChatStore } from "@/store/chatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  // 近30天情绪趋势数据
  const emotionTrendData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayMsgs = messages.filter(
        (m) =>
          m.role === "assistant" &&
          m.emotionScore !== undefined &&
          new Date(m.timestamp).toISOString().split("T")[0] === dateStr
      );
      const lastMsg = dayMsgs[dayMsgs.length - 1];
      return { date: dateStr, score: lastMsg?.emotionScore ?? null, label };
    });
  }, [messages]);

  // 连续记录天数
  const streakCount = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const hasActivityOn = (dateStr: string): boolean => {
      const hasSchedule = schedules.some((s) => s.date === dateStr);
      const hasNote = dailyNotes.some((n) => n.date === dateStr && n.content.trim().length > 0);
      const hasChat = messages.some(
        (m) => m.role === "user" && new Date(m.timestamp).toISOString().split("T")[0] === dateStr
      );
      return hasSchedule || hasNote || hasChat;
    };

    const startOffset = hasActivityOn(todayStr) ? 0 : 1;
    let streak = 0;
    for (let i = startOffset; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (hasActivityOn(d.toISOString().split("T")[0])) streak++;
      else break;
    }
    return streak;
  }, [schedules, dailyNotes, messages]);

  // 月度自动总结
  const monthlySummary = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthMsgs = messages.filter(
      (m) =>
        m.role === "assistant" &&
        m.emotionScore !== undefined &&
        new Date(m.timestamp).toISOString().slice(0, 7) === monthStr
    );
    if (monthMsgs.length === 0) return null;

    const avgScore =
      Math.round(
        (monthMsgs.reduce((sum, m) => sum + (m.emotionScore ?? 0), 0) / monthMsgs.length) * 10
      ) / 10;

    const emotionCounts: Record<string, { count: number; emoji: string }> = {};
    monthMsgs.forEach((m) => {
      if (m.emotionType) {
        emotionCounts[m.emotionType] = emotionCounts[m.emotionType] || {
          count: 0,
          emoji: m.emotionEmoji || "",
        };
        emotionCounts[m.emotionType].count++;
      }
    });
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1].count - a[1].count)[0];
    const mostCommonEmotion = topEmotion ? `${topEmotion[1].emoji} ${topEmotion[0]}` : "😌 平静";

    const monthSchedules = schedules.filter((s) => s.date.startsWith(monthStr));
    const completionRateMonth =
      monthSchedules.length > 0
        ? Math.round(
            (monthSchedules.filter((s) => s.completed).length / monthSchedules.length) * 100
          )
        : null;

    const daysInMonth = getDaysInMonth(year, month);
    let activeDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateFromParts(year, month, day);
      const active =
        schedules.some((s) => s.date === dateStr) ||
        dailyNotes.some((n) => n.date === dateStr && n.content.trim()) ||
        messages.some(
          (m) => m.role === "user" && new Date(m.timestamp).toISOString().split("T")[0] === dateStr
        );
      if (active) activeDays++;
    }

    return { activeDays, avgScore, mostCommonEmotion, completionRateMonth };
  }, [messages, schedules, dailyNotes, year, month]);

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          {/* 连续记录天数 */}
          <div className="mt-3 flex items-center gap-3 p-3 border-2 border-foreground rounded-lg bg-card neo-shadow-sm">
            <Flame
              className="h-6 w-6 shrink-0"
              style={{ color: "hsl(var(--neo-orange))" }}
            />
            <div>
              <span className="text-2xl font-black">{streakCount}</span>
              <span className="text-sm font-medium ml-1">天连续记录</span>
            </div>
            {streakCount >= 7 && (
              <span
                className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border-2 border-foreground"
                style={{ backgroundColor: "hsl(var(--neo-orange))" }}
              >
                🔥 坚持达人
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 近30天情绪走势 */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">近30天情绪走势</CardTitle>
        </CardHeader>
        <CardContent>
          {emotionTrendData.every((d) => d.score === null) ? (
            <p className="text-muted-foreground text-center py-6 text-sm">
              开始与 AI 对话后，情绪走势将在这里显示
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart
                data={emotionTrendData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="emotionGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(199, 89%, 60%)" />
                    <stop offset="100%" stopColor="hsl(142, 69%, 58%)" />
                  </linearGradient>
                  <linearGradient id="emotionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 69%, 58%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={6}
                />
                <YAxis
                  domain={[1, 10]}
                  ticks={[1, 5, 10]}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0]?.value != null ? (
                      <div className="border-2 border-foreground bg-card px-3 py-1.5 rounded-lg text-xs font-bold neo-shadow-sm">
                        情绪分：{payload[0].value}/10
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="url(#emotionGrad)"
                  strokeWidth={2.5}
                  fill="url(#emotionFill)"
                  connectNulls={false}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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

      {/* 月度总结 */}
      <Card className="neo-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            {year}年{month + 1}月总结
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySummary === null ? (
            <p className="text-muted-foreground text-center py-4 text-sm">
              暂无数据 — 这个月还没有情绪记录
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                本月你共记录了{" "}
                <span className="font-black text-base">{monthlySummary.activeDays}</span>{" "}
                天，平均情绪得分{" "}
                <span className="font-black text-base">{monthlySummary.avgScore}</span>
                /10，最常出现的情绪是{" "}
                <span className="font-black">{monthlySummary.mostCommonEmotion}</span>。
                {monthlySummary.completionRateMonth !== null && (
                  <>
                    {" "}日程完成率{" "}
                    <span className="font-black text-base">
                      {monthlySummary.completionRateMonth}%
                    </span>
                    。
                  </>
                )}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 border-2 border-foreground rounded-lg bg-muted/50">
                  <p className="text-lg font-black">{monthlySummary.activeDays}</p>
                  <p className="text-xs text-muted-foreground">活跃天数</p>
                </div>
                <div className="text-center p-2 border-2 border-foreground rounded-lg bg-muted/50">
                  <p className="text-lg font-black">{monthlySummary.avgScore}</p>
                  <p className="text-xs text-muted-foreground">平均情绪</p>
                </div>
                <div className="text-center p-2 border-2 border-foreground rounded-lg bg-muted/50">
                  <p className="text-lg font-black">
                    {monthlySummary.completionRateMonth !== null
                      ? `${monthlySummary.completionRateMonth}%`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">日程完成</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
