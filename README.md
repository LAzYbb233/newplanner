# MoodLens

Photo-driven Mood Tracker — 通过拍摄/上传照片，自动识别内容并推断情绪，构建数字化的自我记录。

## 技术栈

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI 风格组件 (Card, Button, Tabs, Slider)
- Recharts 图表
- Zustand 状态管理
- Lucide React 图标

## 本地运行

```bash
npm install
npm run dev
```

在浏览器打开 [http://localhost:3000](http://localhost:3000)。移动端优先；桌面端以居中手机宽度展示。

## 功能概览

- **Home:** 时间线展示照片与情绪卡片，按情绪配色。
- **Record:** 上传/拍照 → 2 秒分析动画 → 结果确认页（可编辑日期、地点、标签、情绪、强度、摘要）→ 保存。
- **Insights:** 情绪日历（按日情绪点）、情绪趋势折线图、场景分布饼图。
- **Profile:** 「本周的你」AI 风格摘要（当前为 Mock 文案）。

## 项目结构

```
src/
├── app/(tabs)/          # 底部 Tab 页面与 Record 子流程
├── components/           # layout/BottomNav, home/MoodCard, insights/*
├── store/moodStore.ts    # Zustand 状态
├── types/mood.ts         # MoodType, MoodRecord
└── data/mockRecords.ts   # 初始 Mock 数据
```
