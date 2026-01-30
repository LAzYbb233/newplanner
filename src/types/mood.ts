export type MoodType =
  | "Happy"
  | "Calm"
  | "Sad"
  | "Anxious"
  | "Energetic";

/** UI 展示用：Tired -> Sad, Excited -> Energetic */
export const MOOD_UI_OPTIONS = [
  "Happy",
  "Calm",
  "Anxious",
  "Tired",
  "Excited",
] as const;
export type MoodUIOption = (typeof MOOD_UI_OPTIONS)[number];

export function moodUIOptionToType(ui: MoodUIOption): MoodType {
  if (ui === "Tired") return "Sad";
  if (ui === "Excited") return "Energetic";
  return ui as MoodType;
}

export function moodTypeToUIOption(mood: MoodType): MoodUIOption {
  if (mood === "Sad") return "Tired";
  if (mood === "Energetic") return "Excited";
  return mood as MoodUIOption;
}

export interface MoodRecord {
  id: string;
  imageUrl: string;
  timestamp: number;
  location?: string;
  tags: string[];
  mood: MoodType;
  moodIntensity: number; // 1-10
  aiSummary: string;
  userNote?: string;
}
