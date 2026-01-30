"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MoodRecord } from "@/types/mood";
import { useMemo } from "react";

export function MoodTrendChart({ records }: { records: MoodRecord[] }) {
  const data = useMemo(() => {
    return [...records]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((r) => ({
        date: new Date(r.timestamp).toLocaleDateString("zh-CN", {
          month: "numeric",
          day: "numeric",
        }),
        value: r.moodIntensity,
        full: new Date(r.timestamp).toLocaleString("zh-CN"),
      }));
  }, [records]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        暂无数据
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[1, 10]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                return (
                  <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
                    <p className="text-muted-foreground">{payload[0].payload.full}</p>
                    <p className="font-medium">情绪能量: {payload[0].value}/10</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
