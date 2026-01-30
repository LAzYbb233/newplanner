import type { MoodRecord } from "@/types/mood";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop";

export const mockRecords: MoodRecord[] = [
  {
    id: "mock-1",
    imageUrl: PLACEHOLDER,
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    location: "Home",
    tags: ["Coffee", "Morning", "Reading"],
    mood: "Calm",
    moodIntensity: 7,
    aiSummary: "一个安静的早晨，适合阅读与思考。",
  },
  {
    id: "mock-2",
    imageUrl: PLACEHOLDER,
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    location: "Coffee Shop",
    tags: ["Coffee", "Sunset", "Cat"],
    mood: "Happy",
    moodIntensity: 8,
    aiSummary: "看起来是一个惬意的下午。",
  },
  {
    id: "mock-3",
    imageUrl: PLACEHOLDER,
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    location: "Work",
    tags: ["Desk", "Screen", "Focus"],
    mood: "Anxious",
    moodIntensity: 4,
    aiSummary: "工作场景，略显疲惫。",
  },
  {
    id: "mock-4",
    imageUrl: PLACEHOLDER,
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    location: "Outdoors",
    tags: ["Park", "Sun", "Walk"],
    mood: "Energetic",
    moodIntensity: 9,
    aiSummary: "户外散步带来好心情。",
  },
  {
    id: "mock-5",
    imageUrl: PLACEHOLDER,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    location: "Home",
    tags: ["Night", "Rest"],
    mood: "Sad",
    moodIntensity: 3,
    aiSummary: "夜晚独处，情绪有些低落。",
  },
  {
    id: "mock-6",
    imageUrl: PLACEHOLDER,
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    location: "Outdoors",
    tags: ["Travel", "Nature"],
    mood: "Happy",
    moodIntensity: 10,
    aiSummary: "旅行中的快乐时光。",
  },
];
