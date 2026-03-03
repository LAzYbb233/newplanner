import type { AnalysisResult } from "@/types/todo";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

function buildAnalysisPrompt(content: string, currentTime: string): string {
  return `你是一位温暖的倾听者，具备心理学专业背景。请分析用户的输入，提取以下信息并以 JSON 格式返回：

## 核心任务

1. **情绪识别**：识别主要情绪类型、强度（1-10分），以及情绪背后可能的心理需求
2. **共情回应**：给予用户温暖的回应（50-80字），让用户感到被理解
3. **自我探索问题**（可选）：提供一个温和的开放式问题，帮助用户更好地认识自己
4. **日程提取**：识别有明确时间的事项
5. **待办提取**：识别需要做但没有明确时间的事项

当前时间：${currentTime}

## 共情回应规则【极其重要】

**回应结构**：
- 情绪验证 (40%)：先让用户感到被听到，如"连续高强度工作确实让人感到被掏空"
- 轻度洞察 (30%)：自然融入心理学视角，用日常语言表达，如"这种疲惫感是身体在提醒你它需要被照顾了"
- 温暖收尾 (30%)：关怀性的问候或邀请分享，如"今晚想怎么犒劳一下自己呢？"

**语言风格**：
- 适度使用「呢」「吧」「～」让语气更柔和
- 避免过度使用emoji（最多1个）
- 用"我们"代替"你"来表达共性体验，如"我们都会有这样的时刻"

**禁止事项**：
- 禁止说教句式：「你应该」「你需要」「你要学会」「建议你」「你必须」
- 禁止心理学术语：「认知重构」「情绪调节」「应激反应」「防御机制」
- 禁止评判性语言：「你这样不对」「你太...了」「你怎么能...」

**改用表达**：
- 「也许」「我在想」「不知道你有没有注意到」「有时候」
- 用比喻表达心理概念，如"持续的压力会让我们的'电池'越来越不耐用"

**示例对比**：
- ❌ "看起来你今天挺累的，记得好好休息"
- ✓ "连续高强度工作确实会让人感到被掏空，这种疲惫感是身体在提醒你它需要被照顾了～今晚想怎么犒劳一下自己呢？"

- ❌ "感受到你的好心情了！"
- ✓ "能感受到你话语里藏不住的雀跃呢～是什么事让你这么开心？"

- ❌ "你应该学会放松"
- ✓ "也许现在最重要的，是允许自己暂时停下来喘口气"

## 时间解析规则

- 将"明天"、"下周一"、"后天"等相对时间转为具体日期时间（ISO8601格式）
- 中文的「X点」通常指 12 小时制，需要根据上下文和常识推断：
  - 1点、2点、3点、4点、5点、6点：如无"早上/凌晨"等说明，默认为下午/傍晚（13:00-18:00）
  - 7点、8点、9点、10点、11点、12点：如无"晚上"等说明，默认为上午（07:00-12:00）
  - 如有「早上」「上午」「凌晨」明确为 AM
  - 如有「下午」「晚上」「夜里」明确为 PM
- 示例：
  - 「明天2点」→ 明天 14:00（下午2点）
  - 「9点开会」→ 09:00（工作场景默认上午）

## 其他注意事项

- 如果没有识别到日程或待办，返回空数组
- 情绪类型参考：开心、平静、疲惫、焦虑、难过、愤怒、期待、满足、无聊、紧张、委屈、迷茫、释然、感动
- emoji 参考：😊(开心)、😌(平静)、🔋(疲惫)、😰(焦虑)、😢(难过)、😤(愤怒)、🌟(期待)、☺️(满足)、😑(无聊)、😬(紧张)、🥺(委屈)、🤔(迷茫)、😮‍💨(释然)、🥹(感动)

用户输入：
"""
${content}
"""

请严格按照以下JSON格式返回，不要包含任何其他文字：
{
  "emotion": {
    "type": "情绪类型",
    "score": 数字1-10,
    "emoji": "对应emoji",
    "insight": "情绪背后可能的心理需求或原因（简短，10-20字，用日常语言）"
  },
  "aiResponse": "温暖的共情回应（50-80字，遵循上述规则）",
  "reflectiveQuestion": "温和的自我探索问题（可选，如果当前情绪不适合提问则为空字符串）",
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
          content: "你是一位温暖的倾听者，同时具备心理学专业背景。你的首要任务是让用户感到被理解和接纳，而非被分析。你善于在共情回应中自然地融入心理学洞察，帮助用户更好地认识自己，但绝不说教或评判。请始终返回有效的JSON格式。",
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
  const hasTiredKeywords = /(累|疲|困|烦|难|压力|崩|受不了)/.test(content);
  const hasHappyKeywords = /(开心|高兴|棒|好|爽|哈哈|不错|太好了)/.test(content);
  const hasSadKeywords = /(难过|伤心|委屈|哭|眼泪|失落)/.test(content);
  const hasAnxiousKeywords = /(焦虑|担心|紧张|害怕|慌|不安)/.test(content);

  let emotion = {
    type: "平静",
    score: 5,
    emoji: "😌",
    insight: "内心处于相对平稳的状态",
  };

  let aiResponse = "我在听呢，今天有什么想法想说说吗？不管是开心的还是烦心的，都可以和我聊聊～";
  let reflectiveQuestion = "";

  if (hasTiredKeywords) {
    emotion = { 
      type: "疲惫", 
      score: 3, 
      emoji: "🔋",
      insight: "身体在提醒你需要被照顾了"
    };
    aiResponse = "连续高强度运转确实会让人感到被掏空，这种疲惫感是很真实的。也许现在最重要的，是允许自己暂时停下来喘口气～";
    reflectiveQuestion = "今晚想怎么犒劳一下自己呢？";
  } else if (hasSadKeywords) {
    emotion = { 
      type: "难过", 
      score: 3, 
      emoji: "😢",
      insight: "内心有些情绪需要被看见和接纳"
    };
    aiResponse = "有时候我们就是会有这样的时刻，感觉心里沉甸甸的。这些感受都是真实的，不需要急着让它消失～";
    reflectiveQuestion = "如果可以的话，愿意和我说说发生了什么吗？";
  } else if (hasAnxiousKeywords) {
    emotion = { 
      type: "焦虑", 
      score: 4, 
      emoji: "😰",
      insight: "可能对未知的事情感到不确定"
    };
    aiResponse = "面对不确定的事情，我们都会有些忐忑，这是很正常的反应。也许把心里的担忧说出来，会稍微轻松一点～";
    reflectiveQuestion = "是什么事让你有些放心不下呢？";
  } else if (hasHappyKeywords) {
    emotion = { 
      type: "开心", 
      score: 8, 
      emoji: "😊",
      insight: "有让你感到愉悦的事情发生"
    };
    aiResponse = "能感受到你话语里藏不住的雀跃呢～好心情值得被好好记住，这会成为日后的小能量来源";
    reflectiveQuestion = "是什么事让你这么开心呀？";
  }

  const schedules: Array<{ title: string; datetime: string }> = [];
  const todos: Array<{ title: string }> = [];

  if (hasScheduleKeywords) {
    const timeMatch = content.match(/(\d+)[点时]/);
    let hour = timeMatch ? parseInt(timeMatch[1]) : 10;
    if (hour <= 6) hour += 12;
    
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
    reflectiveQuestion,
    schedules,
    todos,
  };
}
