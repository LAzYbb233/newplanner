import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, AnalysisConfirmData } from "@/types/chat";
import type { AnalysisResult } from "@/types/todo";
import { useJournalStore } from "./journalStore";
import {
  getSupabase,
  isSupabaseConfigured,
  type DbChatMessage,
} from "@/lib/supabase";

interface ChatState {
  messages: ChatMessage[];
  isAITyping: boolean;
  enableProactiveMessages: boolean;
  pendingConfirmation: AnalysisConfirmData | null;
  isOnline: boolean;
  isInitialized: boolean;
  
  addMessage: (message: Omit<ChatMessage, "id">) => Promise<void>;
  sendMessage: (userMessage: string) => Promise<void>;
  initializeChat: () => void;
  toggleProactiveMessages: () => void;
  loadMessages: () => Promise<void>;
  
  setPendingConfirmation: (data: AnalysisConfirmData | null) => void;
  confirmAnalysis: (data: AnalysisConfirmData) => Promise<void>;
  cancelConfirmation: () => void;
  
  setOnlineStatus: (status: boolean) => void;
}

function generateId(prefix: string = "msg"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const FIXED_NOW = 1738316400000;

function dbChatMessageToChatMessage(db: DbChatMessage): ChatMessage {
  return {
    id: db.id,
    role: db.role,
    content: db.content,
    timestamp: new Date(db.created_at).getTime(),
    emotionType: db.emotion_type || undefined,
    emotionScore: db.emotion_score || undefined,
    originalInput: db.original_input || undefined,
  };
}

function buildContextSummary(): {
  schedules: any[];
  moodRecords: any[];
  dailyNotes: any[];
  todos: any[];
  todayDate: string;
} {
  const journalStore = useJournalStore.getState();
  const todayDate = new Date().toISOString().split("T")[0];
  
  return {
    schedules: journalStore.schedules,
    moodRecords: journalStore.records,
    dailyNotes: journalStore.dailyNotes,
    todos: journalStore.todos,
    todayDate,
  };
}

function generateLocalAIResponse(userMessage: string): string {
  const context = buildContextSummary();
  const message = userMessage.toLowerCase();
  
  if (message.includes("今天")) {
    const todaySchedules = context.schedules.filter(s => s.date === context.todayDate);
    const completed = todaySchedules.filter(s => s.completed).length;
    const total = todaySchedules.length;
    const pendingTodos = context.todos.filter(t => !t.completed).length;
    
    if (total === 0 && pendingTodos === 0) {
      return "今天还是空白的一天呢。要不要从记录今天的心情开始，或者规划一下要做的事情？";
    }
    
    let response = `今天你安排了 ${total} 项日程`;
    if (total > 0) {
      response += `，已完成 ${completed} 项`;
    }
    if (pendingTodos > 0) {
      response += `。还有 ${pendingTodos} 项待办事项需要处理`;
    }
    response += "。\n\n加油！💪";
    
    return response;
  }
  
  if (message.includes("心情") || message.includes("情绪") || message.includes("感觉")) {
    const recentMoods = context.moodRecords.slice(0, 7);
    
    if (recentMoods.length === 0) {
      return "我注意到你还没有记录过心情。要不要开始记录一下，这有助于了解自己的情绪变化～";
    }
    
    const emojiSummary = recentMoods.map(m => m.emoji).join(" ");
    return `你最近的心情（${emojiSummary}）看起来还不错。有什么特别的感受想分享吗？`;
  }
  
  if (message.includes("待办") || message.includes("todo")) {
    const pendingTodos = context.todos.filter(t => !t.completed);
    if (pendingTodos.length === 0) {
      return "你目前没有待办事项，太棒了！要不要添加一些新的目标？";
    }
    return `你还有 ${pendingTodos.length} 项待办事项：\n${pendingTodos.slice(0, 5).map(t => `• ${t.title}`).join("\n")}\n\n一步一步来，你可以的！`;
  }
  
  const responses = [
    "我在这里陪伴你。有什么想聊的，随时告诉我～",
    "说说看，今天过得怎么样？",
    "我很想听听你的想法，继续说下去吧。",
    "嗯嗯，我在听。还有什么想分享的吗？",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateProactiveMessage(): string | null {
  const context = buildContextSummary();
  
  const recentSchedules = context.schedules
    .filter(s => s.date <= context.todayDate)
    .slice(0, 10);
  const uncompletedCount = recentSchedules.filter(s => !s.completed).length;
  
  if (uncompletedCount >= 5) {
    return "我注意到你最近有不少日程还没完成。是遇到什么困难了吗？要不要一起梳理一下优先级？";
  }
  
  const lastMoodRecord = context.moodRecords[0];
  if (!lastMoodRecord) {
    return "欢迎来到 MoodLens～我是你的 AI 伙伴，可以帮你分析情绪、提取日程和待办。试着告诉我你的想法吧！";
  }
  
  return "你好～有什么想和我分享的吗？我可以帮你分析情绪、记录日程和待办事项。";
}

async function callAnalyzeAPI(content: string): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    throw new Error("API request failed");
  }
  
  return response.json();
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
  messages: [],
  isAITyping: false,
  enableProactiveMessages: true,
  pendingConfirmation: null,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isInitialized: false,
  
  loadMessages: async () => {
    if (!isSupabaseConfigured()) {
      return;
    }
    
    const currentMessages = get().messages;
    
    try {
      const client = getSupabase()!;
      const { data, error } = await client
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      
      if (error) throw error;
      
      const loadedMessages = (data || []).map(dbChatMessageToChatMessage);
      
      if (loadedMessages.length > 0 || currentMessages.length === 0) {
        set({ messages: loadedMessages });
      }
    } catch (error) {
      console.error("加载消息失败:", error);
    }
  },
  
addMessage: async (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId("msg"),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabase()!;
        await client.from("chat_messages").insert({
          id: newMessage.id,
          role: newMessage.role,
          content: newMessage.content,
          emotion_type: newMessage.emotionType || null,
          emotion_score: newMessage.emotionScore || null,
          emotion_emoji: newMessage.emotionEmoji || null,
          original_input: newMessage.originalInput || null,
        });
      } catch (error) {
        console.error("保存消息失败:", error);
      }
    }
  },
  
  sendMessage: async (userMessage) => {
    const { addMessage, isOnline } = get();
    
    await addMessage({
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    });
    
    set({ isAITyping: true });
    
    try {
      if (isOnline) {
        const analysisResult = await callAnalyzeAPI(userMessage);
        
        const hasSchedulesOrTodos = 
          analysisResult.schedules.length > 0 || 
          analysisResult.todos.length > 0;
        
        if (hasSchedulesOrTodos) {
          const confirmData: AnalysisConfirmData = {
            originalText: userMessage,
            aiResponse: analysisResult.aiResponse,
            emotion: analysisResult.emotion,
            schedules: analysisResult.schedules.map((s, i) => ({
              id: `schedule-temp-${i}`,
              title: s.title,
              datetime: s.datetime,
              selected: true,
            })),
            todos: analysisResult.todos.map((t, i) => ({
              id: `todo-temp-${i}`,
              title: t.title,
              selected: true,
            })),
          };
          
          set({ 
            pendingConfirmation: confirmData,
            isAITyping: false,
          });
        } else {
          await addMessage({
            role: "assistant",
            content: analysisResult.aiResponse,
            timestamp: Date.now(),
            emotionType: analysisResult.emotion.type,
            emotionScore: analysisResult.emotion.score,
            emotionEmoji: analysisResult.emotion.emoji,
          });
          set({ isAITyping: false });
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        const localResponse = generateLocalAIResponse(userMessage);
        await addMessage({
          role: "assistant",
          content: localResponse,
          timestamp: Date.now(),
        });
        set({ isAITyping: false });
      }
    } catch (error) {
      console.error("AI 分析失败:", error);
      const fallbackResponse = generateLocalAIResponse(userMessage);
      await addMessage({
        role: "assistant",
        content: fallbackResponse,
        timestamp: Date.now(),
      });
      set({ isAITyping: false });
    }
  },
  
initializeChat: () => {
    const { messages, enableProactiveMessages, isInitialized } = get();
    
    if (isInitialized) {
      return;
    }

    if (messages.length === 0 && enableProactiveMessages) {
      const welcomeMessage = generateProactiveMessage();
      if (welcomeMessage) {
        set({
          isInitialized: true,
          messages: [
            {
              id: generateId("msg"),
              role: "assistant",
              content: welcomeMessage,
              timestamp: FIXED_NOW,
            },
          ],
        });
        return;
      }
    }
    
    set({ isInitialized: true });
  },
  
  toggleProactiveMessages: () => {
    set((state) => ({
      enableProactiveMessages: !state.enableProactiveMessages,
    }));
  },
  
  setPendingConfirmation: (data) => {
    set({ pendingConfirmation: data });
  },
  
  confirmAnalysis: async (data) => {
    const { addMessage } = get();
    const journalStore = useJournalStore.getState();
    
    for (const schedule of data.schedules) {
      if (schedule.selected) {
        const date = new Date(schedule.datetime);
        const dateStr = date.toISOString().split("T")[0];
        const timeStr = date.toTimeString().slice(0, 5);
        await journalStore.addSchedule(dateStr, schedule.title, timeStr);
      }
    }
    
    for (const todo of data.todos) {
      if (todo.selected) {
        await journalStore.addTodo(todo.title, undefined, 'ai');
      }
    }
    
    let confirmMessage = data.aiResponse;
    
    const savedSchedules = data.schedules.filter(s => s.selected).length;
    const savedTodos = data.todos.filter(t => t.selected).length;
    
    if (savedSchedules > 0 || savedTodos > 0) {
      confirmMessage += "\n\n";
      if (savedSchedules > 0) {
        confirmMessage += `✅ 已保存 ${savedSchedules} 项日程\n`;
      }
      if (savedTodos > 0) {
        confirmMessage += `✅ 已保存 ${savedTodos} 项待办`;
      }
    }
    
    await addMessage({
      role: "assistant",
      content: confirmMessage,
      timestamp: Date.now(),
      emotionType: data.emotion.type,
      emotionScore: data.emotion.score,
      emotionEmoji: data.emotion.emoji,
      originalInput: data.originalText,
    });
    
    set({ pendingConfirmation: null });
  },
  
  cancelConfirmation: () => {
    const { addMessage, pendingConfirmation } = get();
    
    if (pendingConfirmation) {
      addMessage({
        role: "assistant",
        content: pendingConfirmation.aiResponse + "\n\n（已取消保存日程和待办）",
        timestamp: Date.now(),
        emotionType: pendingConfirmation.emotion.type,
        emotionScore: pendingConfirmation.emotion.score,
        emotionEmoji: pendingConfirmation.emotion.emoji,
      });
    }
    
    set({ pendingConfirmation: null });
  },
  
  setOnlineStatus: (status) => {
    set({ isOnline: status });
  },
}),
    {
      name: "moodlens-chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        enableProactiveMessages: state.enableProactiveMessages,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
