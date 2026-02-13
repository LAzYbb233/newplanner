import { create } from "zustand";
import type { MoodRecord } from "@/types/mood";
import type { Schedule } from "@/types/schedule";
import type { DailyNote } from "@/types/dailyNote";

interface JournalState {
  // Schedules (原 todos)
  schedules: Schedule[];
  addSchedule: (date: string, content: string, startTime?: string, endTime?: string) => void;
  toggleSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;

  // MoodRecords（简化）
  records: MoodRecord[];
  addRecord: (record: Omit<MoodRecord, "id">) => void;
  deleteRecord: (id: string) => void;

  // Daily Notes
  dailyNotes: DailyNote[];
  updateDailyNote: (date: string, content: string) => void;
}

function generateId(prefix: string = "item"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Mock data - 使用固定时间戳避免 hydration 错误
const FIXED_NOW = 1738316400000; // 2026-01-31 12:00:00
const ONE_DAY = 86400000;
const ONE_HOUR = 3600000;

const today = new Date(FIXED_NOW);
const yesterday = new Date(FIXED_NOW - ONE_DAY);
const twoDaysAgo = new Date(FIXED_NOW - 2 * ONE_DAY);

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const mockSchedules: Schedule[] = [
  {
    id: "schedule-1",
    date: formatDate(today),
    content: "团队早会",
    completed: false,
    createdAt: FIXED_NOW - 7 * ONE_HOUR,
    startTime: "09:00",
  },
  {
    id: "schedule-2",
    date: formatDate(today),
    content: "健身房锻炼",
    completed: false,
    createdAt: FIXED_NOW - 6 * ONE_HOUR,
    startTime: "14:00",
    endTime: "15:30",
  },
  {
    id: "schedule-3",
    date: formatDate(today),
    content: "准备晚餐",
    completed: true,
    createdAt: FIXED_NOW - 5 * ONE_HOUR,
  },
  {
    id: "schedule-4",
    date: formatDate(yesterday),
    content: "完成项目文档",
    completed: true,
    createdAt: FIXED_NOW - ONE_DAY,
    startTime: "10:00",
  },
];

const mockRecords: MoodRecord[] = [
  {
    id: "mood-1",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    timestamp: FIXED_NOW - 2 * ONE_HOUR,
    emoji: "😊",
    note: "今天心情不错！",
  },
  {
    id: "mood-2",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    timestamp: FIXED_NOW - ONE_DAY,
    emoji: "😌",
    note: "平静的一天",
  },
];

const mockDailyNotes: DailyNote[] = [
  {
    id: "note-1",
    date: formatDate(today),
    content: "今天天气不错，适合写代码。",
    updatedAt: FIXED_NOW,
  },
  {
    id: "note-2",
    date: formatDate(yesterday),
    content: "昨天完成了很多任务，感觉很充实。",
    updatedAt: FIXED_NOW - ONE_DAY,
  },
];

export const useJournalStore = create<JournalState>((set) => ({
  // Schedules
  schedules: mockSchedules,

  addSchedule: (date, content, startTime, endTime) =>
    set((state) => ({
      schedules: [
        ...state.schedules,
        {
          id: generateId("schedule"),
          date,
          content,
          completed: false,
          createdAt: Date.now(),
          startTime,
          endTime,
        },
      ],
    })),

  toggleSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    })),

  deleteSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),

  // MoodRecords
  records: mockRecords,

  addRecord: (record) =>
    set((state) => ({
      records: [
        { ...record, id: generateId("mood") } as MoodRecord,
        ...state.records,
      ],
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    })),

  // Daily Notes
  dailyNotes: mockDailyNotes,

  updateDailyNote: (date, content) =>
    set((state) => {
      const existing = state.dailyNotes.find((n) => n.date === date);
      if (existing) {
        return {
          dailyNotes: state.dailyNotes.map((n) =>
            n.date === date
              ? { ...n, content, updatedAt: Date.now() }
              : n
          ),
        };
      } else {
        return {
          dailyNotes: [
            ...state.dailyNotes,
            {
              id: generateId("note"),
              date,
              content,
              updatedAt: Date.now(),
            },
          ],
        };
      }
    }),
}));

// Backward compatibility alias (for any remaining references)
export const useMoodStore = useJournalStore;
