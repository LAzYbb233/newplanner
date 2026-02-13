"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void | Promise<void>;
  disabled?: boolean;
}

const QUICK_QUESTIONS = [
  "我最近心情怎么样？",
  "今天的日程完成得如何？",
  "给我一些建议",
  "总结一下这周",
];

export function ChatInputArea({ onSendMessage, disabled = false }: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (trimmed && !disabled && !isSending) {
      setIsSending(true);
      setInputValue("");
      
      try {
        await onSendMessage(trimmed);
      } catch (error) {
        console.error('发送消息失败:', error);
      } finally {
        setIsSending(false);
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleQuickQuestion = async (question: string) => {
    if (!disabled && !isSending) {
      setIsSending(true);
      try {
        await onSendMessage(question);
      } catch (error) {
        console.error('发送消息失败:', error);
      } finally {
        setIsSending(false);
      }
    }
  };
  
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* 快捷问题按钮 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              disabled={disabled || isSending}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border border-border",
                "bg-background hover:bg-muted transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "active:scale-95 hover:shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              )}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      
      {/* 输入框和发送按钮 */}
      <div className="px-4 pb-4 flex items-center space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "AI 正在回复..." : "说说你的想法..."}
          disabled={disabled || isSending}
          className={cn(
            "flex-1 transition-all duration-200",
            "focus:ring-2 focus:ring-ring focus:ring-offset-1"
          )}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !inputValue.trim() || isSending}
          size="icon"
          className={cn(
            "shrink-0 transition-all duration-200",
            "hover:scale-105 active:scale-95",
            inputValue.trim() && !disabled && !isSending && "animate-pulse"
          )}
        >
          <Send className={cn(
            "h-4 w-4 transition-transform duration-200",
            isSending && "scale-0"
          )} />
        </Button>
      </div>
    </div>
  );
}
