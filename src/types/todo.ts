export interface TodoItem {
  id: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  source: 'ai' | 'manual';
  createdAt: number;
}

export interface PendingAnalysis {
  id: string;
  content: string;
  createdAt: number;
  synced: boolean;
}

export interface AnalysisResult {
  emotion: {
    type: string;
    score: number; // 1-10
    emoji: string;
  };
  aiResponse: string;
  schedules: Array<{
    title: string;
    datetime: string; // ISO8601
  }>;
  todos: Array<{
    title: string;
  }>;
}
