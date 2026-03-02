"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/chatStore";
import type { AnalysisConfirmData } from "@/types/chat";
import { Calendar, CheckSquare, Pencil, X, Check, Sparkles } from "lucide-react";

interface AnalysisConfirmCardProps {
  data: AnalysisConfirmData;
}

export function AnalysisConfirmCard({ data }: AnalysisConfirmCardProps) {
  const { confirmAnalysis, cancelConfirmation, setPendingConfirmation } = useChatStore();
  
  const [editingText, setEditingText] = useState(false);
  const [originalText, setOriginalText] = useState(data.originalText);
  const [schedules, setSchedules] = useState(data.schedules);
  const [todos, setTodos] = useState(data.todos);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const handleToggleSchedule = (id: string) => {
    setSchedules(prev => 
      prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    );
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => 
      prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t)
    );
  };

  const handleEditSchedule = (id: string, title: string) => {
    setSchedules(prev => 
      prev.map(s => s.id === id ? { ...s, title } : s)
    );
    setEditingScheduleId(null);
  };

  const handleEditTodo = (id: string, title: string) => {
    setTodos(prev => 
      prev.map(t => t.id === id ? { ...t, title } : t)
    );
    setEditingTodoId(null);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirm = () => {
    const updatedData: AnalysisConfirmData = {
      ...data,
      originalText,
      schedules,
      todos,
    };
    confirmAnalysis(updatedData);
  };

  const formatDateTime = (datetime: string) => {
    try {
      const date = new Date(datetime);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let dateStr = "";
      if (date.toDateString() === now.toDateString()) {
        dateStr = "今天";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        dateStr = "明天";
      } else {
        dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
      }
      
      const timeStr = date.toTimeString().slice(0, 5);
      return `${dateStr} ${timeStr}`;
    } catch {
      return datetime;
    }
  };

  return (
    <Card className="neo-card border-4 border-foreground bg-gradient-to-br from-neo-yellow/20 to-neo-pink/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black">
          <Sparkles className="h-5 w-5 text-neo-pink" />
          AI 分析结果
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 原文区域 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">你的原话</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingText(!editingText)}
              className="h-6 px-2"
            >
              <Pencil className="h-3 w-3 mr-1" />
              编辑
            </Button>
          </div>
          {editingText ? (
            <Textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="neo-input min-h-[60px]"
              onBlur={() => setEditingText(false)}
              autoFocus
            />
          ) : (
            <div className="p-3 rounded-lg border-2 border-foreground/20 bg-card text-sm">
              &ldquo;{originalText}&rdquo;
            </div>
          )}
        </div>

        {/* AI 回复区域 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground">AI 懂你</span>
            <span className="text-lg">{data.emotion.emoji}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
              {data.emotion.type} {data.emotion.score}/10
            </span>
          </div>
          <div className="p-3 rounded-lg border-2 border-neo-green/50 bg-neo-green/10 text-sm">
            {data.aiResponse}
          </div>
        </div>

        {/* 日程列表 */}
        {schedules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neo-blue" />
              <span className="text-sm font-bold">识别到的日程</span>
            </div>
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-2 p-2 rounded-lg border-2 border-foreground/20 bg-card"
                >
                  <Checkbox
                    checked={schedule.selected}
                    onCheckedChange={() => handleToggleSchedule(schedule.id)}
                    className="h-5 w-5 border-2 border-foreground"
                  />
                  {editingScheduleId === schedule.id ? (
                    <Input
                      value={schedule.title}
                      onChange={(e) => handleEditSchedule(schedule.id, e.target.value)}
                      className="flex-1 h-8 neo-input"
                      autoFocus
                      onBlur={() => setEditingScheduleId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingScheduleId(null);
                      }}
                    />
                  ) : (
                    <>
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        📅 {formatDateTime(schedule.datetime)}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {schedule.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setEditingScheduleId(schedule.id)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 待办列表 */}
        {todos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-neo-pink" />
              <span className="text-sm font-bold">识别到的待办</span>
            </div>
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 p-2 rounded-lg border-2 border-foreground/20 bg-card"
                >
                  <Checkbox
                    checked={todo.selected}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                    className="h-5 w-5 border-2 border-foreground"
                  />
                  {editingTodoId === todo.id ? (
                    <Input
                      value={todo.title}
                      onChange={(e) => handleEditTodo(todo.id, e.target.value)}
                      className="flex-1 h-8 neo-input"
                      autoFocus
                      onBlur={() => setEditingTodoId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingTodoId(null);
                      }}
                    />
                  ) : (
                    <>
                      <span className="text-xs font-medium text-muted-foreground">
                        📦 待定
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {todo.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setEditingTodoId(todo.id)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={cancelConfirmation}
            variant="outline"
            className="flex-1 neo-btn border-2 border-foreground"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 neo-btn bg-neo-green border-2 border-foreground text-foreground font-bold"
          >
            <Check className="h-4 w-4 mr-2" />
            确认保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
