import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";
import { useJournalStore } from "./journalStore";

interface ChatState {
  messages: ChatMessage[];
  isAITyping: boolean;
  enableProactiveMessages: boolean;
  addMessage: (role: "user" | "assistant", content: string) => void;
  sendMessage: (userMessage: string) => Promise<void>;
  initializeChat: () => void;
  toggleProactiveMessages: () => void;
}

function generateId(prefix: string = "msg"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 固定时间戳避免 hydration 错误
const FIXED_NOW = 1738316400000; // 2026-01-31 12:00:00

// 构建上下文数据摘要
function buildContextSummary(): {
  schedules: any[];
  moodRecords: any[];
  dailyNotes: any[];
  todayDate: string;
} {
  const journalStore = useJournalStore.getState();
  const todayDate = new Date(FIXED_NOW).toISOString().split("T")[0];
  
  return {
    schedules: journalStore.schedules,
    moodRecords: journalStore.records,
    dailyNotes: journalStore.dailyNotes,
    todayDate,
  };
}

// Mock AI 响应生成器（增强版）
function generateAIResponse(userMessage: string): string {
  const context = buildContextSummary();
  const message = userMessage.toLowerCase();
  
  // 1. 关于"今天"的查询 - 增强版
  if (message.includes("今天")) {
    const todaySchedules = context.schedules.filter(s => s.date === context.todayDate);
    const completed = todaySchedules.filter(s => s.completed).length;
    const total = todaySchedules.length;
    const todayMoods = context.moodRecords.filter(m => {
      const moodDate = new Date(m.timestamp).toISOString().split("T")[0];
      return moodDate === context.todayDate;
    });
    
    if (total === 0 && todayMoods.length === 0) {
      return "今天还是空白的一天呢。要不要从记录今天的心情开始，或者规划一下要做的事情？";
    }
    
    if (total === 0) {
      return `今天你记录了心情 ${todayMoods.map(m => m.emoji).join(" ")}，但还没安排具体日程。需要帮你梳理一下今天想做的事吗？`;
    }
    
    if (completed === total && total > 0) {
      return `今天你安排了 ${total} 项日程，已经全部完成了！${todayMoods.length > 0 ? `今天的心情是 ${todayMoods[0].emoji}，` : ""}真是充实又高效的一天 ✨`;
    }
    
    // 分析未完成任务
    const pending = todaySchedules.filter(s => !s.completed);
    const hasTimeSlot = pending.some(s => s.startTime);
    
    return `今天你安排了 ${total} 项日程，已完成 ${completed} 项。\n\n${hasTimeSlot ? "剩下的任务有设定时间，记得按计划推进哦～" : "建议为剩余任务设定时间段，更容易完成！"}\n\n${completed > total / 2 ? "进展不错，加油！💪" : "先完成最重要的 1-2 项，不要给自己太大压力～"}`;
  }
  
  // 2. 关于心情和情绪 - 增强版
  if (message.includes("心情") || message.includes("情绪") || message.includes("感觉")) {
    const recentMoods = context.moodRecords.slice(0, 7);
    
    if (recentMoods.length === 0) {
      return "我注意到你还没有记录过心情。要不要开始记录一下，这有助于了解自己的情绪变化～\n\n💡 小提示：每天用一个 emoji 和照片记录当下的感受，坚持一周就能看到变化！";
    }
    
    const emojiSummary = recentMoods.map(m => m.emoji).join(" ");
    const emojiCounts: Record<string, number> = {};
    recentMoods.forEach(m => {
      emojiCounts[m.emoji] = (emojiCounts[m.emoji] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0];
    const happyEmojis = ["😊", "💪", "😌"];
    const sadEmojis = ["😢", "😰"];
    const happyCount = recentMoods.filter(m => happyEmojis.includes(m.emoji)).length;
    const sadCount = recentMoods.filter(m => sadEmojis.includes(m.emoji)).length;
    
    if (happyCount >= recentMoods.length * 0.7) {
      return `从你最近的记录来看（${emojiSummary}），整体状态很棒！${mostFrequent[1] > 1 ? `特别是 ${mostFrequent[0]} 出现了 ${mostFrequent[1]} 次，` : ""}保持这份好心情～\n\n${recentMoods[0].note ? `你最近写道："${recentMoods[0].note.slice(0, 30)}${recentMoods[0].note.length > 30 ? "..." : ""}"` : ""}`;
    }
    
    if (sadCount >= recentMoods.length * 0.5) {
      return `我看到你最近的心情（${emojiSummary}）有些低落，${mostFrequent[1] > 2 ? `${mostFrequent[0]} 这个状态出现得比较多。` : ""}\n\n有什么想和我聊聊的吗？说出来会好一些。或者试试做一些让自己放松的事情，比如散步、听音乐。\n\n记住，情绪有起伏是正常的 💙`;
    }
    
    // 检查情绪波动
    const hasFluctuation = new Set(recentMoods.slice(0, 3).map(m => m.emoji)).size >= 3;
    if (hasFluctuation) {
      return `你最近的心情（${emojiSummary}）变化比较频繁，这可能说明你正在经历一些事情。\n\n如果感到困扰，不妨在日记里写下具体的想法和原因，这有助于理清思绪～`;
    }
    
    return `你最近的心情（${emojiSummary}）看起来比较稳定，${mostFrequent[0]} 是主旋律。有什么特别的感受想分享吗？`;
  }
  
  // 3. 请求建议 - 增强版
  if (message.includes("建议") || message.includes("怎么办") || message.includes("如何") || message.includes("帮")) {
    const recentSchedules = context.schedules.slice(0, 15);
    const completionRate = recentSchedules.length > 0
      ? recentSchedules.filter(s => s.completed).length / recentSchedules.length
      : 0;
    const recentMoods = context.moodRecords.slice(0, 5);
    const moodDiversity = new Set(recentMoods.map(m => m.emoji)).size;
    
    let advice = "基于你的数据，我有以下建议：\n\n";
    
    if (completionRate < 0.3) {
      advice += "📋 **关于日程**：\n• 每天只设定 3-5 个核心任务\n• 为任务设定具体时间段\n• 完成后立即打勾，增强成就感\n• 把大任务拆解成小步骤\n\n";
    } else if (completionRate > 0.7) {
      advice += "📋 **关于日程**：\n• 你的执行力很强！保持这个节奏\n• 可以适当挑战更有意义的目标\n\n";
    }
    
    if (recentMoods.length < 3) {
      advice += "💭 **关于心情记录**：\n• 建议每天至少记录一次心情\n• 配合照片和文字，效果更好\n• 坚持记录能发现情绪规律\n\n";
    } else if (moodDiversity <= 2) {
      advice += "💭 **关于情绪觉察**：\n• 尝试捕捉更细微的情绪变化\n• 问问自己：此刻最主要的感受是什么？\n• 记录触发情绪的具体事件\n\n";
    }
    
    advice += "✨ **通用建议**：\n• 劳逸结合，适当安排休息时间\n• 关注那些让你感到愉悦的时刻\n• 对自己保持耐心和善意\n\n";
    advice += "记住，成长是一个过程，小步前进也是进步！💪";
    
    return advice;
  }
  
  // 4. 总结和回顾 - 增强版
  if (message.includes("这周") || message.includes("最近") || message.includes("总结") || message.includes("回顾")) {
    const weekSchedules = context.schedules.slice(0, 20);
    const weekMoods = context.moodRecords.slice(0, 7);
    const weekNotes = context.dailyNotes.slice(0, 7);
    const completedCount = weekSchedules.filter(s => s.completed).length;
    const totalCount = weekSchedules.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // 分析情绪趋势
    const happyEmojis = ["😊", "💪", "😌"];
    const sadEmojis = ["😢", "😰"];
    const happyCount = weekMoods.filter(m => happyEmojis.includes(m.emoji)).length;
    const moodTrend = happyCount >= weekMoods.length * 0.6 ? "积极向上 ↗️" : 
                      happyCount <= weekMoods.length * 0.3 ? "需要关注 ↘️" : 
                      "较为平稳 →";
    
    let summary = `让我总结一下你最近的状态：\n\n`;
    summary += `📊 **数据概览**\n`;
    summary += `• 日程：完成 ${completedCount}/${totalCount} 项（${completionRate}%）\n`;
    summary += `• 心情：记录了 ${weekMoods.length} 次\n`;
    summary += `• 日记：写了 ${weekNotes.length} 篇\n\n`;
    
    if (weekMoods.length > 0) {
      summary += `💭 **心情分析**\n`;
      summary += `• 最近心情：${weekMoods.map(m => m.emoji).join(" ")}\n`;
      summary += `• 整体趋势：${moodTrend}\n`;
      
      // 找出最频繁的情绪
      const emojiCounts: Record<string, number> = {};
      weekMoods.forEach(m => {
        emojiCounts[m.emoji] = (emojiCounts[m.emoji] || 0) + 1;
      });
      const topEmoji = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0];
      if (topEmoji[1] > 1) {
        summary += `• 主要情绪：${topEmoji[0]}（出现 ${topEmoji[1]} 次）\n`;
      }
      summary += `\n`;
    }
    
    if (completionRate >= 70) {
      summary += `🌟 **亮点**\n你的执行力很强，完成率很高！保持这个状态～\n\n`;
    } else if (completionRate < 40 && totalCount > 5) {
      summary += `💡 **改进建议**\n日程完成率不太高，试试减少任务数量，专注核心目标～\n\n`;
    }
    
    summary += `继续保持记录的习惯，你会越来越了解自己！`;
    
    return summary;
  }
  
  // 5. 情感支持类
  if (message.includes("累") || message.includes("疲惫") || message.includes("压力") || message.includes("焦虑")) {
    return "听起来你现在有些疲惫。这种时候，给自己一些空间休息很重要。\n\n你可以试试：\n• 短暂的散步，让身体动起来\n• 深呼吸 5 分钟，放松神经\n• 做一件简单但让你感到愉悦的事\n• 或者就是什么都不做，静静地待着\n\n记住，休息不是懒惰，是为了更好地前进。你已经做得很好了 💙";
  }
  
  if (message.includes("开心") || message.includes("高兴") || message.includes("快乐")) {
    return "太好了！能感受到你的喜悦 😊\n\n开心的时刻值得被好好记录和珍藏。要不要去日程页面记录一下这份好心情，配上一张照片？\n\n保持这份愉悦，也记得把快乐分享给身边的人～";
  }
  
  // 6. 礼貌回应
  if (message.includes("谢谢") || message.includes("感谢") || message.includes("辛苦")) {
    return "不客气～我很高兴能陪伴你。有任何想聊的，随时找我！\n\n记住，我会一直在这里 💫";
  }
  
  if (message.includes("你好") || message.includes("在吗") || message.includes("在不在")) {
    return "我在呢！有什么想聊的吗？\n\n你可以问我关于你的日程、心情，或者就是聊聊天～";
  }
  
  // 7. 元问题（关于我是谁）
  if (message.includes("你是谁") || message.includes("你是什么") || message.includes("介绍")) {
    return "我是你的数字自我伙伴 🤖\n\n我会基于你记录的日程、心情和日记，与你进行对话，提供个性化的陪伴和建议。\n\n你可以：\n• 问我关于你的数据分析\n• 向我倾诉心情和感受\n• 寻求建议和鼓励\n• 或者就是随便聊聊\n\n我会认真倾听，用心回应 💙";
  }
  
  // 8. 数据查询类
  if (message.includes("多少") || message.includes("几个") || message.includes("统计")) {
    const totalSchedules = context.schedules.length;
    const totalMoods = context.moodRecords.length;
    const totalNotes = context.dailyNotes.length;
    
    return `让我帮你统计一下：\n\n📊 **你的数据**\n• 总共创建了 ${totalSchedules} 项日程\n• 记录了 ${totalMoods} 次心情\n• 写了 ${totalNotes} 篇日记\n\n${totalSchedules + totalMoods + totalNotes > 20 ? "哇，你已经记录了很多内容！这些都是你成长的轨迹 ✨" : "继续保持记录，数据越多，我能给你的洞察就越准确～"}`;
  }
  
  // 默认回复（更有温度）
  const responses = [
    "我在这里陪伴你。有什么想聊的，随时告诉我～",
    "说说看，今天过得怎么样？",
    "我很想听听你的想法，继续说下去吧。",
    "嗯嗯，我在听。还有什么想分享的吗？",
    "这个话题很有意思，你可以告诉我更多细节吗？",
    "我理解你的感受。要不要详细说说是什么让你有这样的想法？",
    "听起来你在思考一些重要的事情。我很愿意听你讲～",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// 生成主动关怀消息
function generateProactiveMessage(): string | null {
  const context = buildContextSummary();
  
  // 检查连续未完成日程
  const recentSchedules = context.schedules
    .filter(s => s.date <= context.todayDate)
    .slice(0, 10);
  const uncompletedCount = recentSchedules.filter(s => !s.completed).length;
  
  if (uncompletedCount >= 5) {
    return "我注意到你最近有不少日程还没完成。是遇到什么困难了吗？要不要一起梳理一下优先级？";
  }
  
  // 检查很久没记录心情
  const lastMoodRecord = context.moodRecords[0];
  if (!lastMoodRecord) {
    return "欢迎来到数字自我空间～我是你的 AI 伙伴，会基于你的日程和心情记录与你对话。开始记录一些心情吧！";
  }
  
  const daysSinceLastMood = Math.floor((FIXED_NOW - lastMoodRecord.timestamp) / (1000 * 60 * 60 * 24));
  if (daysSinceLastMood >= 3) {
    return `你已经 ${daysSinceLastMood} 天没有记录心情了，最近过得怎么样？有什么想和我分享的吗？`;
  }
  
  // 检查今天的心情
  const todayMoods = context.moodRecords.filter(m => {
    const moodDate = new Date(m.timestamp).toISOString().split("T")[0];
    return moodDate === context.todayDate;
  });
  
  if (todayMoods.length > 0 && ["😊", "💪"].includes(todayMoods[0].emoji)) {
    return `看到你今天心情很好 ${todayMoods[0].emoji}，有什么开心的事吗？和我分享一下吧～`;
  }
  
  // 默认欢迎消息
  return "你好～我会根据你的日程和心情记录与你对话。有什么想聊的，随时告诉我！";
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isAITyping: false,
  enableProactiveMessages: true, // 默认开启 AI 主动消息
  
  addMessage: (role, content) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId("msg"),
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    }));
  },
  
  sendMessage: async (userMessage) => {
    const { addMessage } = get();
    
    // 添加用户消息
    addMessage("user", userMessage);
    
    // 模拟 AI 思考时间
    set({ isAITyping: true });
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    // 生成 AI 响应
    const aiResponse = generateAIResponse(userMessage);
    addMessage("assistant", aiResponse);
    
    set({ isAITyping: false });
  },
  
  initializeChat: () => {
    const { messages, enableProactiveMessages } = get();
    
    // 只在首次初始化时添加欢迎消息，且需要开启主动消息功能
    if (messages.length === 0 && enableProactiveMessages) {
      const welcomeMessage = generateProactiveMessage();
      if (welcomeMessage) {
        set({
          messages: [
            {
              id: generateId("msg"),
              role: "assistant",
              content: welcomeMessage,
              timestamp: FIXED_NOW,
            },
          ],
        });
      }
    }
  },
  
  toggleProactiveMessages: () => {
    set((state) => ({
      enableProactiveMessages: !state.enableProactiveMessages,
    }));
  },
}));
