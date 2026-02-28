"use client";

import { Plus } from "lucide-react";

interface HeaderProps {
  onAddSchedule?: () => void;
}

export function Header({ onAddSchedule }: HeaderProps) {
  return (
    <header className="relative px-4 py-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              MOODLENS
            </h1>
            <p className="text-lg font-medium mt-1">你的数字手帐</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Made with Neo-Brutalism Style
            </p>
          </div>
          
          {onAddSchedule && (
            <button
              onClick={onAddSchedule}
              className="neo-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-neo-yellow"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">添加日程</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
