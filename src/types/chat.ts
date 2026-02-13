export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  // 可选：引用的数据上下文
  contextData?: {
    schedules?: string[]; // Schedule IDs
    moodRecords?: string[]; // MoodRecord IDs
    dateRange?: { start: string; end: string };
  };
}
