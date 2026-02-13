"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isAITyping?: boolean;
}

// 格式化相对时间
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 10) return "刚刚";
  if (seconds < 60) return `${seconds}秒前`;
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  // 超过7天显示具体日期
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function ChatMessageList({ messages, isAITyping = false }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAITyping]);
  
  if (messages.length === 0 && !isAITyping) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-muted-foreground max-w-xs">
          <div className="text-4xl mb-4 animate-pulse">💭</div>
          <p className="text-base font-medium mb-2">开始对话吧～</p>
          <p className="text-xs opacity-70">
            你可以问我关于你的日程、心情，或者就是随便聊聊
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={messagesContainerRef} className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        return (
          <div
            key={message.id}
            className={cn(
              "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all",
                "hover:shadow-md",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
                isLastMessage && "animate-in zoom-in-95 duration-200"
              )}
            >
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-xs opacity-50",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                {formatRelativeTime(message.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
      
      {/* AI 正在输入提示 - 增强版 */}
      {isAITyping && (
        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <div 
                className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" 
                style={{ animationDelay: "0ms", animationDuration: "1s" }} 
              />
              <div 
                className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" 
                style={{ animationDelay: "200ms", animationDuration: "1s" }} 
              />
              <div 
                className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" 
                style={{ animationDelay: "400ms", animationDuration: "1s" }} 
              />
              <span className="ml-2 text-xs text-muted-foreground">思考中...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 用于自动滚动的锚点 */}
      <div ref={messagesEndRef} />
    </div>
  );
}
