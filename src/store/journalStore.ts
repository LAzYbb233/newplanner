import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MoodRecord } from "@/types/mood";
import type { Schedule } from "@/types/schedule";
import type { DailyNote } from "@/types/dailyNote";
import type { TodoItem } from "@/types/todo";
import {
  getSupabase,
  isSupabaseConfigured,
  type DbSchedule,
  type DbMoodRecord,
  type DbDailyNote,
  type DbTodo,
} from "@/lib/supabase";

interface JournalState {
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;

  // Schedules (原 todos)
  schedules: Schedule[];
  addSchedule: (
    date: string,
    content: string,
    startTime?: string,
    endTime?: string
  ) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // MoodRecords
  records: MoodRecord[];
  addRecord: (record: Omit<MoodRecord, "id">) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;

  // Daily Notes
  dailyNotes: DailyNote[];
  updateDailyNote: (date: string, content: string) => Promise<void>;

  // Todos (待办事项)
  todos: TodoItem[];
  addTodo: (title: string, dueDate?: string, source?: 'ai' | 'manual') => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, title: string, dueDate?: string) => Promise<void>;

  // 数据加载
  loadData: () => Promise<void>;
}

// 数据转换函数：数据库 -> 前端
function dbScheduleToSchedule(db: DbSchedule): Schedule {
  return {
    id: db.id,
    date: db.date,
    content: db.content,
    completed: db.completed,
    createdAt: new Date(db.created_at).getTime(),
    startTime: db.start_time || undefined,
    endTime: db.end_time || undefined,
  };
}

function dbMoodRecordToMoodRecord(db: DbMoodRecord): MoodRecord {
  return {
    id: db.id,
    imageUrl: db.image_url,
    timestamp: new Date(db.timestamp).getTime(),
    emoji: db.emoji,
    note: db.note || undefined,
  };
}

function dbDailyNoteToDailyNote(db: DbDailyNote): DailyNote {
  return {
    id: db.id,
    date: db.date,
    content: db.content,
    updatedAt: new Date(db.updated_at).getTime(),
  };
}

function dbTodoToTodo(db: DbTodo): TodoItem {
  return {
    id: db.id,
    title: db.title,
    dueDate: db.due_date || undefined,
    completed: db.completed,
    source: db.source,
    createdAt: new Date(db.created_at).getTime(),
  };
}

// Mock 数据（用于 Supabase 未配置时的本地测试）
const FIXED_NOW = 1738316400000; // 2026-01-31 12:00:00
const ONE_DAY = 86400000;
const ONE_HOUR = 3600000;

const today = new Date(FIXED_NOW);
const yesterday = new Date(FIXED_NOW - ONE_DAY);

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
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    timestamp: FIXED_NOW - 2 * ONE_HOUR,
    emoji: "😊",
    note: "今天心情不错！",
  },
  {
    id: "mood-2",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
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

const mockTodos: TodoItem[] = [
  {
    id: "todo-1",
    title: "拿快递",
    completed: false,
    source: "manual",
    createdAt: FIXED_NOW - 2 * ONE_HOUR,
  },
  {
    id: "todo-2",
    title: "回复邮件",
    dueDate: formatDate(today),
    completed: true,
    source: "ai",
    createdAt: FIXED_NOW - 3 * ONE_HOUR,
  },
];

// isSupabaseConfigured 已从 @/lib/supabase 导入

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
  // 初始状态
  isLoading: false,
  isInitialized: false,
  schedules: [],
  records: [],
  dailyNotes: [],
  todos: [],

  // 加载所有数据
  loadData: async () => {
    if (get().isLoading) return;

    set({ isLoading: true });

    // 如果 Supabase 未配置，使用 mock 数据
    if (!isSupabaseConfigured()) {
      console.log("Supabase 未配置，使用本地 mock 数据");
      set({
        schedules: mockSchedules,
        records: mockRecords,
        dailyNotes: mockDailyNotes,
        todos: mockTodos,
        isLoading: false,
        isInitialized: true,
      });
      return;
    }

    try {
      const client = getSupabase()!;
      // 并行加载所有数据
      const [schedulesRes, recordsRes, notesRes, todosRes] = await Promise.all([
        client.from("schedules").select("*").order("created_at", { ascending: false }),
        client.from("mood_records").select("*").order("timestamp", { ascending: false }),
        client.from("daily_notes").select("*").order("updated_at", { ascending: false }),
        client.from("todos").select("*").order("created_at", { ascending: false }),
      ]);

      const schedules = (schedulesRes.data || []).map(dbScheduleToSchedule);
      const records = (recordsRes.data || []).map(dbMoodRecordToMoodRecord);
      const dailyNotes = (notesRes.data || []).map(dbDailyNoteToDailyNote);
      const todos = (todosRes.data || []).map(dbTodoToTodo);

      set({
        schedules,
        records,
        dailyNotes,
        todos,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("加载数据失败:", error);
      // 失败时使用 mock 数据
      set({
        schedules: mockSchedules,
        records: mockRecords,
        dailyNotes: mockDailyNotes,
        todos: mockTodos,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  // Schedules CRUD
  addSchedule: async (date, content, startTime, endTime) => {
    if (!isSupabaseConfigured()) {
      // 本地模式
      const newSchedule: Schedule = {
        id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        date,
        content,
        completed: false,
        createdAt: Date.now(),
        startTime,
        endTime,
      };
      set((state) => ({ schedules: [...state.schedules, newSchedule] }));
      return;
    }

    const client = getSupabase()!;
    const { data, error } = await client
      .from("schedules")
      .insert({
        date,
        content,
        completed: false,
        start_time: startTime || null,
        end_time: endTime || null,
      })
      .select()
      .single();

    if (error) {
      console.error("添加日程失败:", error);
      return;
    }

    set((state) => ({
      schedules: [...state.schedules, dbScheduleToSchedule(data)],
    }));
  },

  toggleSchedule: async (id) => {
    const schedule = get().schedules.find((s) => s.id === id);
    if (!schedule) return;

    // 乐观更新
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    }));

    if (!isSupabaseConfigured()) return;

    const client = getSupabase()!;
    const { error } = await client
      .from("schedules")
      .update({ completed: !schedule.completed })
      .eq("id", id);

    if (error) {
      console.error("切换日程状态失败:", error);
      // 回滚
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === id ? { ...s, completed: schedule.completed } : s
        ),
      }));
    }
  },

  deleteSchedule: async (id) => {
    const schedule = get().schedules.find((s) => s.id === id);

    // 乐观删除
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    }));

    if (!isSupabaseConfigured()) return;

    const client = getSupabase()!;
    const { error } = await client.from("schedules").delete().eq("id", id);

    if (error) {
      console.error("删除日程失败:", error);
      // 回滚
      if (schedule) {
        set((state) => ({ schedules: [...state.schedules, schedule] }));
      }
    }
  },

  // MoodRecords CRUD
  addRecord: async (record) => {
    if (!isSupabaseConfigured()) {
      // 本地模式
      const newRecord: MoodRecord = {
        ...record,
        id: `mood-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      };
      set((state) => ({ records: [newRecord, ...state.records] }));
      return;
    }

    const client = getSupabase()!;
    const { data, error } = await client
      .from("mood_records")
      .insert({
        image_url: record.imageUrl,
        timestamp: new Date(record.timestamp).toISOString(),
        emoji: record.emoji,
        note: record.note || null,
      })
      .select()
      .single();

    if (error) {
      console.error("添加心情记录失败:", error);
      return;
    }

    set((state) => ({
      records: [dbMoodRecordToMoodRecord(data), ...state.records],
    }));
  },

  deleteRecord: async (id) => {
    const record = get().records.find((r) => r.id === id);

    // 乐观删除
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
    }));

    if (!isSupabaseConfigured()) return;

    const client = getSupabase()!;
    const { error } = await client.from("mood_records").delete().eq("id", id);

    if (error) {
      console.error("删除心情记录失败:", error);
      // 回滚
      if (record) {
        set((state) => ({ records: [record, ...state.records] }));
      }
    }
  },

  // Daily Notes CRUD
  updateDailyNote: async (date, content) => {
    const existing = get().dailyNotes.find((n) => n.date === date);

    if (existing) {
      // 乐观更新
      set((state) => ({
        dailyNotes: state.dailyNotes.map((n) =>
          n.date === date ? { ...n, content, updatedAt: Date.now() } : n
        ),
      }));

      if (!isSupabaseConfigured()) return;

      const client = getSupabase()!;
      const { error } = await client
        .from("daily_notes")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (error) {
        console.error("更新每日笔记失败:", error);
        // 回滚
        set((state) => ({
          dailyNotes: state.dailyNotes.map((n) =>
            n.date === date ? existing : n
          ),
        }));
      }
    } else {
      // 新建
      if (!isSupabaseConfigured()) {
        const newNote: DailyNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          date,
          content,
          updatedAt: Date.now(),
        };
        set((state) => ({ dailyNotes: [...state.dailyNotes, newNote] }));
        return;
      }

      const client = getSupabase()!;
      const { data, error } = await client
        .from("daily_notes")
        .insert({ date, content })
        .select()
        .single();

      if (error) {
        console.error("创建每日笔记失败:", error);
        return;
      }

      set((state) => ({
        dailyNotes: [...state.dailyNotes, dbDailyNoteToDailyNote(data)],
      }));
    }
  },

  // Todos CRUD
  addTodo: async (title, dueDate, source = 'manual') => {
    if (!isSupabaseConfigured()) {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title,
        dueDate,
        completed: false,
        source,
        createdAt: Date.now(),
      };
      set((state) => ({ todos: [newTodo, ...state.todos] }));
      return;
    }

    const client = getSupabase()!;
    const { data, error } = await client
      .from("todos")
      .insert({
        title,
        due_date: dueDate || null,
        completed: false,
        source,
      })
      .select()
      .single();

    if (error) {
      console.error("添加待办失败:", error);
      // Supabase 失败时回退到本地内存存储
      const fallbackTodo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title,
        dueDate,
        completed: false,
        source,
        createdAt: Date.now(),
      };
      set((state) => ({ todos: [fallbackTodo, ...state.todos] }));
      return;
    }

    set((state) => ({
      todos: [dbTodoToTodo(data), ...state.todos],
    }));
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    // 乐观更新
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));

    if (!isSupabaseConfigured()) return;

    const client = getSupabase()!;
    const { error } = await client
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id);

    if (error) {
      console.error("切换待办状态失败:", error);
      // 只有当错误不是"表不存在"时才回滚（表不存在说明使用本地模式，应保留乐观更新）
      if (error.code !== 'PGRST205') {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: todo.completed } : t
          ),
        }));
      }
    }
  },

  deleteTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id);

    // 乐观删除
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));

    if (!isSupabaseConfigured()) return;

    const client = getSupabase()!;
    const { error } = await client.from("todos").delete().eq("id", id);

    if (error) {
      console.error("删除待办失败:", error);
      // 只有当错误不是"表不存在"时才回滚
      if (error.code !== 'PGRST205' && todo) {
        set((state) => ({ todos: [todo, ...state.todos] }));
      }
    }
  },

  updateTodo: async (id, title, dueDate) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    // 乐观更新
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, title, dueDate } : t
      ),
    }));

    if (!isSupabaseConfigured()) return;

    const client = getSupabase()!;
    const { error } = await client
      .from("todos")
      .update({ title, due_date: dueDate || null })
      .eq("id", id);

    if (error) {
      console.error("更新待办失败:", error);
      // 只有当错误不是"表不存在"时才回滚
      if (error.code !== 'PGRST205') {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? todo : t
          ),
        }));
      }
    }
  },
}),
    {
      name: "journal-storage",
      partialize: (state) => ({
        todos: state.todos,
        schedules: state.schedules,
        records: state.records,
        dailyNotes: state.dailyNotes,
      }),
    }
  )
);

// Backward compatibility alias
export const useMoodStore = useJournalStore;
