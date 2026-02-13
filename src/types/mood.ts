export interface MoodRecord {
  id: string;
  imageUrl: string; // 用户上传的图片（blob URL 或 base64）
  timestamp: number;
  emoji: string; // 预定义 emoji，如 "😊" "😢" "😰" 等
  note?: string; // 可选文字备注
}

// 预定义情绪 emoji（对应原 MoodType）
export const MOOD_EMOJIS = {
  Happy: "😊",
  Calm: "😌",
  Sad: "😢",
  Anxious: "😰",
  Energetic: "💪",
} as const;

export type MoodEmojiKey = keyof typeof MOOD_EMOJIS;
