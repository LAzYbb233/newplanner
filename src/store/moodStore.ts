import { create } from "zustand";
import type { MoodRecord } from "@/types/mood";
import { mockRecords } from "@/data/mockRecords";

interface MoodState {
  records: MoodRecord[];
  addRecord: (record: Omit<MoodRecord, "id">) => void;
  updateRecord: (id: string, updates: Partial<MoodRecord>) => void;
  deleteRecord: (id: string) => void;
}

function generateId(): string {
  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useMoodStore = create<MoodState>((set) => ({
  records: mockRecords,

  addRecord: (record) =>
    set((state) => ({
      records: [
        { ...record, id: generateId() } as MoodRecord,
        ...state.records,
      ],
    })),

  updateRecord: (id, updates) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    })),
}));
