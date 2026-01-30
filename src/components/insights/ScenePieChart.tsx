"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MoodRecord } from "@/types/mood";
import { useMemo } from "react";

const SCENES = ["Home", "Work", "Outdoors", "Coffee Shop"] as const;
const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#a855f7"];

export function ScenePieChart({ records }: { records: MoodRecord[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const scene of SCENES) counts[scene] = 0;
    for (const r of records) {
      const loc = r.location || "Home";
      counts[loc] = (counts[loc] ?? 0) + 1;
    }
    return SCENES.filter((s) => counts[s] > 0).map((name, i) => ({
      name,
      value: counts[name],
      color: COLORS[i % COLORS.length],
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const p = payload[0].payload;
                const total = data.reduce((s, d) => s + d.value, 0);
                const pct = total ? ((p.value / total) * 100).toFixed(0) : 0;
                return (
                  <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted-foreground">
                      {p.value} 次 ({pct}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
