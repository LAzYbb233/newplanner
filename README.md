# MoodLens

Photo-driven Mood Tracker — 通过拍摄/上传照片，记录情绪，构建数字化的自我手帐。

## 特色功能

### 手帐模式首页
- **左右翻页**：每一页代表一天，像真实手帐一样翻阅
- **日程管理**：支持添加日程，可选设置时间段（开始时间或时间范围），自动按时间排序
- **心情记录**：内联上传照片 + 选择情绪 emoji（😊😌😢😰💪），无需跳转页面
- **自由笔记**：随手记录今天的想法，自动保存
- **手帐样式**：Neo-Brutalism 风格，大胆配色、粗边框

### AI 情绪分析（新功能）
- **智能分析**：通过 DeepSeek API 分析用户输入的文字
- **情绪识别**：自动识别情绪类型和强度（1-10分）
- **日程提取**：从文字中自动提取有时间的事项
- **待办提取**：识别需要做但没有明确时间的待办事项
- **二次确认**：识别结果需要用户确认后才会保存（防止 AI 幻觉）
- **离线支持**：离线时本地保存，网络恢复后自动同步

### 待办管理
- **每日待办**：独立的待办列表，与日程分开管理
- **AI 来源标记**：区分手动添加和 AI 识别的待办
- **完成状态**：支持勾选完成、显示/隐藏已完成项

### 交互方式
- 点击左右箭头按钮翻页
- 触摸滑动翻页（向左滑查看前一天，向右滑查看后一天）
- 点击"回到今天"快速返回当前日期

## 技术栈

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI 风格组件 (Card, Button, Checkbox, Input, Textarea)
- Zustand 状态管理
- Lucide React 图标
- Supabase (数据持久化)
- DeepSeek API (AI 情绪分析)

## 环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase 配置（可选，不配置则使用本地 mock 数据）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API（可选，不配置则使用本地 mock 分析）
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 本地运行

```bash
npm install
npm run dev
```

在浏览器打开 [http://localhost:3000](http://localhost:3000)

移动端优先设计；桌面端以居中手机宽度展示。

## 核心功能

### 1. Home（手帐页面）
- 日期标题（年月日 + 星期）
- 📅 日程区：
  - 添加日程（可选时间段：开始时间/结束时间）
  - 按时间自动排序（有时间的排前面）
  - 勾选完成、删除
- ✅ 每日待办：
  - 独立的待办列表
  - 支持 AI 自动识别添加
  - 显示/隐藏已完成项
- 💭 今日心情区：
  - 内联上传照片
  - 选择预定义情绪 emoji
  - 添加文字备注
  - 查看当天的心情记录
- ✎ 随手记：
  - 自由文本输入
  - 自动保存（防抖 500ms）

### 2. 随手记（AI 对话）
- **智能分析**：输入文字后 AI 自动分析情绪和提取日程
- **二次确认卡片**：
  - 显示原文（可编辑修正）
  - AI 情绪反馈和共情回复
  - 识别到的日程列表（可勾选、编辑、删除）
  - 识别到的待办列表（可勾选、编辑、删除）
  - 确认后保存到数据库
- **对话历史**：保存所有对话和 AI 分析结果
- **离线支持**：显示在线/离线状态

### 3. Insights（数据洞察）
- 统计卡片：
  - 心情记录总数
  - 日程完成率
  - 待办完成率
  - AI 情绪分析次数
- 情绪趋势分析：
  - 平均情绪分
  - 近期情绪分
  - 趋势方向（上升/下降/稳定）
  - 情绪分布统计
- 情绪日历：显示每天的主导情绪 emoji

### 4. Profile（与自我对话）
- **对话式交互**：基于日程和心情数据的智能 AI 陪伴
- **双向沟通**：AI 主动关怀 + 用户主动提问
- **个性化响应**：深度分析用户数据
- **实时动画**：消息发送/接收动画、AI 输入状态提示

## 数据模型

```typescript
// 日程
interface Schedule {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  completed: boolean;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  createdAt: number;
}

// 待办事项
interface TodoItem {
  id: string;
  title: string;
  dueDate?: string;  // YYYY-MM-DD
  completed: boolean;
  source: 'ai' | 'manual';
  createdAt: number;
}

// 心情记录
interface MoodRecord {
  id: string;
  imageUrl: string;
  timestamp: number;
  emoji: string; // 😊😌😢😰💪
  note?: string;
}

// 日记笔记
interface DailyNote {
  id: string;
  date: string;
  content: string;
  updatedAt: number;
}

// 对话消息
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotionType?: string;   // 情绪类型
  emotionScore?: number;  // 情绪强度 1-10
  emotionEmoji?: string;  // 情绪 emoji
}

// AI 分析结果
interface AnalysisResult {
  emotion: {
    type: string;
    score: number;
    emoji: string;
  };
  aiResponse: string;
  schedules: Array<{ title: string; datetime: string }>;
  todos: Array<{ title: string }>;
}
```

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   └── analyze/route.ts    # DeepSeek API 集成
│   └── (tabs)/
│       ├── layout.tsx          # Tab 布局
│       ├── page.tsx            # 首页
│       ├── insights/page.tsx   # 数据洞察
│       └── profile/page.tsx    # 与自我对话
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── TabNav.tsx
│   ├── content/
│   │   ├── ScheduleContent.tsx  # 日程 + 待办
│   │   ├── ChatContent.tsx      # 随手记对话
│   │   ├── NotesContent.tsx
│   │   └── HistoryContent.tsx
│   ├── chat/
│   │   ├── AnalysisConfirmCard.tsx  # 二次确认卡片
│   │   ├── ChatMessageList.tsx
│   │   └── ChatInputArea.tsx
│   ├── insights/
│   │   └── MoodCalendar.tsx
│   └── ui/                      # Shadcn 组件
├── store/
│   ├── journalStore.ts          # 日程/心情/笔记/待办状态
│   └── chatStore.ts             # 对话状态 + AI 分析
├── types/
│   ├── schedule.ts
│   ├── mood.ts
│   ├── dailyNote.ts
│   ├── chat.ts
│   └── todo.ts
└── lib/
    ├── supabase.ts              # Supabase 客户端
    ├── deepseek.ts              # DeepSeek API 封装
    ├── offlineQueue.ts          # 离线队列管理
    └── utils.ts
```

## 最近更新（v2 产品改进）

### 1. 每日写作提示（InsightContent.tsx）

在 Insight 页面新增「今日一问 ✦」卡片，每天展示一个不同的引导问题，帮助用户破冰冷启动。

- 内置 30 条精心设计的自我探索提示，按年中第几天循环轮换
- 点击「用这个开始 →」直接发送该提示并触发 AI 分析
- 仅在**当天还没有发言**时显示（以今日用户消息的时间戳为判断依据）
- 可手动点击 ✕ 关闭

**关键实现：**
```tsx
const hasTodayUserMessage = messages.some(
  (m) => m.role === "user" &&
    new Date(m.timestamp).toISOString().split("T")[0] === todayStr
);
// 条件：!hasTodayUserMessage && !pendingConfirmation
```

---

### 2. 情绪趋势图 + 连续记录天数（HistoryContent.tsx）

在 History 页面新增两块可视化内容，将 chatStore 中已有的情绪分数数据真正呈现出来。

**情绪趋势图（近 30 天）：**
- 使用 Recharts `AreaChart` 绘制折线面积图
- 每天取最后一条 AI 消息的 `emotionScore` 作为当日情绪值
- `connectNulls={false}` 确保没有对话的天数折线断开，不做插值
- 渐变色填充（蓝→绿），无数据时显示引导空状态

**连续记录天数（🔥 Streak）：**
- 统计连续活跃天数（日程 / 有内容的日记 / 当日发言，三者任一满足即算）
- 今天若还未记录，从昨天起向前计数
- 连续 ≥ 7 天显示「🔥 坚持达人」徽章

---

### 3. AI 历史记忆注入（链式修改 3 个文件）

让 AI 在回复时能感知用户的近期情绪状态和今日日程，实现有温度的「记忆感」。

**数据流：** `chatStore` → `/api/analyze` → `deepseek.ts`

| 文件 | 改动 |
|---|---|
| `src/lib/deepseek.ts` | 新增 `ContextData` 接口、`buildContextSection()` 函数；`analyzeContent` / `getMockAnalysisResult` 接受可选 `context` 参数 |
| `src/app/api/analyze/route.ts` | 从请求 body 中解构 `context`，透传给 `analyzeContent` 和 `getMockAnalysisResult` |
| `src/store/chatStore.ts` | 新增 `buildMessageContext()` 函数，每次发消息时收集近 7 天情绪（最多 5 条）+ 今日日程 + 今日日记，随请求一起发送 |

**注入格式示例（插入 prompt 中）：**
```
--- 用户背景（仅供参考，自然融入，不要直接引用）---
【用户近期情绪】
  - 3月1日：焦虑（6/10）
  - 3月3日：平静（7/10）

【今日日程】
  ○ 14:00 开会
  ✓ 早上跑步
---
```

冷启动时（无历史数据）`buildContextSection` 返回空字符串，prompt 与原版完全相同，无副作用。

---

### 4. 月度自动总结（HistoryContent.tsx）

替换原来的占位符，根据当月真实数据自动生成月度总结。

**展示内容：**
- 活跃天数（有日程/日记/对话的天数）
- 平均情绪得分
- 最常出现的情绪（含 emoji）
- 日程完成率（无日程时显示 `—`）

当月无情绪记录时显示「暂无数据」空状态，不显示错误数据。同时删除了原有无法实现的「高频词汇」占位符 Card。

---

## Supabase 数据库表

如果使用 Supabase，需要创建以下表：

```sql
-- 日程表
create table schedules (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  content text not null,
  completed boolean default false,
  start_time time,
  end_time time,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id)
);

-- 待办表
create table todos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  due_date date,
  completed boolean default false,
  source text default 'manual',
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id)
);

-- 心情记录表
create table mood_records (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  timestamp timestamp with time zone default now(),
  emoji text not null,
  note text,
  user_id uuid references auth.users(id)
);

-- 日记笔记表
create table daily_notes (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  content text not null,
  updated_at timestamp with time zone default now(),
  user_id uuid references auth.users(id)
);

-- 对话消息表
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  role text not null,
  content text not null,
  emotion_type text,
  emotion_score integer,
  emotion_emoji text,
  original_input text,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id)
);
```
