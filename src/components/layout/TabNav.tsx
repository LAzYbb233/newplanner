"use client";

import { cn } from "@/lib/utils";

export type TabType = "schedule" | "notes" | "chat" | "history";

interface Tab {
  id: TabType;
  label: string;
  color: string;
}

const tabs: Tab[] = [
  { id: "schedule", label: "日程", color: "bg-neo-yellow" },
  { id: "notes", label: "随手记", color: "bg-neo-pink" },
  { id: "chat", label: "对话", color: "bg-neo-blue" },
  { id: "history", label: "历史", color: "bg-neo-green" },
];

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="px-4 pb-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex border-4 border-foreground rounded-xl overflow-hidden neo-shadow">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex-1 py-3 px-2 font-bold text-sm md:text-base transition-colors",
                  "border-r-4 border-foreground last:border-r-0",
                  isActive ? tab.color : "bg-card hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
