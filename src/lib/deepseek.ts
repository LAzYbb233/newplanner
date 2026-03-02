import type { AnalysisResult } from "@/types/todo";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

function buildAnalysisPrompt(content: string, currentTime: string): string {
  return `你是一个情绪分析助手。请分析用户的输入，提取以下信息并以 JSON 格式返回：

1. 情绪识别：识别主要情绪类型和强度（1-10分）
2. 共情回复：给予用户温暖、简短的回应（不超过50字）
3. 日程提取：识别有明确时间的事项
4. 待办提取：识别需要做但没有明确时间的事项

当前时间：${currentTime}

【时间解析规则 - 极其重要】：
- 将"明天"、"下周一"、"后天"等相对时间转为具体日期时间（ISO8601格式）
- 中文的「X点」通常指 12 小时制，需要根据上下文和常识推断：
  - 1点、2点、3点、4点、5点、6点：如无"早上/凌晨"等说明，默认为下午/傍晚（13:00-18:00）
  - 7点、8点、9点、10点、11点、12点：如无"晚上"等说明，默认为上午（07:00-12:00）
  - 如有「早上」「上午」「凌晨」明确为 AM
  - 如有「下午」「晚上」「夜里」明确为 PM
- 示例：
  - 「明天2点」→ 明天 14:00（下午2点）
  - 「明天早上2点」→ 明天 02:00
  - 「下午3点」→ 15:00
  - 「晚上8点」→ 20:00
  - 「上午10点」→ 10:00
  - 「9点开会」→ 09:00（工作场景默认上午）

其他注意事项：
- 如果没有识别到日程或待办，返回空数组
- 情绪类型参考：开心、平静、疲惫、焦虑、难过、愤怒、期待、满足、无聊、紧张
- emoji 参考：😊(开心)、😌(平静)、🔋(疲惫)、😰(焦虑)、😢(难过)、😤(愤怒)、🌟(期待)、😊(满足)、😑(无聊)、😬(紧张)

用户输入：
"""
${content}
"""

请严格按照以下JSON格式返回，不要包含任何其他文字：
{
  "emotion": {
    "type": "情绪类型",
    "score": 数字1-10,
    "emoji": "对应emoji"
  },
  "aiResponse": "共情回复文字",
  "schedules": [
    { "title": "事项名称", "datetime": "2026-03-01T10:00:00" }
  ],
  "todos": [
    { "title": "待办事项名称" }
  ]
}`;
}

export async function analyzeContent(
  content: string,
  apiKey: string
): Promise<AnalysisResult> {
  const currentTime = new Date().toISOString();

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个专业的情绪分析助手，擅长理解用户的情感并提取日程和待办事项。请始终返回有效的JSON格式。",
        },
        {
          role: "user",
          content: buildAnalysisPrompt(content, currentTime),
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const assistantMessage = data.choices?.[0]?.message?.content;

  if (!assistantMessage) {
    throw new Error("No response from DeepSeek API");
  }

  try {
    const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const result: AnalysisResult = JSON.parse(jsonMatch[0]);
    
    if (!result.emotion || !result.aiResponse) {
      throw new Error("Invalid response structure");
    }
    
    result.schedules = result.schedules || [];
    result.todos = result.todos || [];
    
    return result;
  } catch (parseError) {
    console.error("Failed to parse DeepSeek response:", assistantMessage);
    throw new Error("Failed to parse AI response as JSON");
  }
}

export function getMockAnalysisResult(content: string): AnalysisResult {
  const hasScheduleKeywords = /(\d+[点时]|早上|下午|晚上|明天|后天|周[一二三四五六日])/.test(content);
  const hasTodoKeywords = /(要|需要|得|应该|记得|别忘了)/.test(content);
  const hasTiredKeywords = /(累|疲|困|烦|难|压力)/.test(content);
  const hasHappyKeywords = /(开心|高兴|棒|好|爽|哈哈|不错)/.test(content);

  let emotion = {
    type: "平静",
    score: 5,
    emoji: "😌",
  };

  let aiResponse = "我听到你了，有什么想和我聊聊的吗？";

  if (hasTiredKeywords) {
    emotion = { type: "疲惫", score: 3, emoji: "🔋" };
    aiResponse = "看起来你今天挺累的，记得好好休息，照顾好自己哦～";
  } else if (hasHappyKeywords) {
    emotion = { type: "开心", score: 8, emoji: "😊" };
    aiResponse = "感受到你的好心情了！继续保持这份愉悦～";
  }

  const schedules: Array<{ title: string; datetime: string }> = [];
  const todos: Array<{ title: string }> = [];

  if (hasScheduleKeywords) {
    const timeMatch = content.match(/(\d+)[点时]/);
    const hour = timeMatch ? parseInt(timeMatch[1]) : 10;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hour, 0, 0, 0);

    const meetingMatch = content.match(/(开会|会议|约|见面|面试|[^，。！？\s]{2,8})/);
    const title = meetingMatch ? meetingMatch[1] : "待定事项";

    schedules.push({
      title: title.replace(/[。！？，]/g, ""),
      datetime: tomorrow.toISOString(),
    });
  }

  if (hasTodoKeywords) {
    const todoMatch = content.match(/(?:要|需要|得|应该|记得|别忘了)([^，。！？]{2,15})/);
    if (todoMatch) {
      todos.push({ title: todoMatch[1].trim() });
    }
  }

  return {
    emotion,
    aiResponse,
    schedules,
    todos,
  };
}
