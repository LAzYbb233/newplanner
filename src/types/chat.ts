export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  // AI 情绪分析结果
  emotionType?: string;
  emotionScore?: number; // 1-10
  emotionEmoji?: string;
  // 原始用户输入（用于编辑确认）
  originalInput?: string;
  // 可选：引用的数据上下文
  contextData?: {
    schedules?: string[]; // Schedule IDs
    moodRecords?: string[]; // MoodRecord IDs
    dateRange?: { start: string; end: string };
  };
}

export interface AnalysisConfirmData {
  originalText: string;
  aiResponse: string;
  emotion: {
    type: string;
    score: number;
    emoji: string;
  };
  schedules: Array<{
    id: string;
    title: string;
    datetime: string;
    selected: boolean;
  }>;
  todos: Array<{
    id: string;
    title: string;
    selected: boolean;
  }>;
}
