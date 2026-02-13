export interface Schedule {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  completed: boolean;
  createdAt: number;
  
  // 新增：时间段字段（可选）
  startTime?: string; // HH:mm 格式，如 "09:00"
  endTime?: string;   // HH:mm 格式，如 "10:30"（可选）
}

// 排序辅助函数
export function sortSchedules(schedules: Schedule[]): Schedule[] {
  return [...schedules].sort((a, b) => {
    // 有时间的排前面，按时间升序
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    // 都没时间，按创建时间
    return a.createdAt - b.createdAt;
  });
}
