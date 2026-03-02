"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, Wifi, WifiOff, Sparkles } from "lucide-react";
import { AnalysisConfirmCard } from "@/components/chat/AnalysisConfirmCard";

export function InsightContent() {
  const { 
    messages, 
    isAITyping, 
    sendMessage, 
    initializeChat,
    pendingConfirmation,
    isOnline,
    setOnlineStatus,
    loadMessages,
    isInitialized,
  } = useChatStore();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
      loadMessages();
    }
  }, [initializeChat, loadMessages, isInitialized]);
  
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingConfirmation]);
  
  const handleSend = useCallback(async () => {
    if (input.trim() && !isAITyping && !pendingConfirmation) {
      const message = input.trim();
      setInput("");
      await sendMessage(message);
    }
  }, [input, isAITyping, sendMessage, pendingConfirmation]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  }, [handleSend]);
  
  return (
    <div className="space-y-4">
      <Card className="neo-card">
        <CardHeader className="border-b-4 border-foreground bg-neo-pink rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle className="text-xl font-black">Insight</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="flex items-center gap-1 text-xs font-medium text-neo-green">
                  <Wifi className="h-3 w-3" />
                  在线
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                  <WifiOff className="h-3 w-3" />
                  离线
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-sm">
            写下你的想法，AI 会帮你分析情绪、提取日程和待办。
            <br />
            <span className="text-xs">识别结果需要你确认后才会保存。</span>
          </p>
        </CardContent>
      </Card>
      
      <Card className="neo-card">
        <CardContent className="py-4">
          <div className="space-y-4 max-h-[450px] overflow-y-auto mb-4">
            {messages.length === 0 && !pendingConfirmation ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">和我聊聊你的想法吧...</p>
                <p className="text-xs">
                  试试说：&ldquo;今天真是累死我了，明天下午2点开会&rdquo;
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`shrink-0 h-8 w-8 rounded-lg border-2 border-foreground flex items-center justify-center ${
                      msg.role === "user" ? "bg-neo-yellow" : "bg-neo-purple"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">🤖</span>
                    )}
                  </div>
                  <div
                    className={`flex-1 p-3 rounded-lg border-2 border-foreground neo-shadow-sm ${
                      msg.role === "user" ? "bg-neo-yellow" : "bg-card"
                    }`}
                  >
                    {msg.role === "assistant" && msg.emotionEmoji && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-foreground/10">
                        <span className="text-lg">{msg.emotionEmoji}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                          {msg.emotionType} {msg.emotionScore}/10
                        </span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {pendingConfirmation && (
              <AnalysisConfirmCard data={pendingConfirmation} />
            )}
            
            {isAITyping && (
              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-lg border-2 border-foreground bg-neo-purple flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="p-3 rounded-lg border-2 border-foreground bg-card neo-shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="text-sm text-muted-foreground mr-2">AI 正在分析</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 p-2 border-4 border-foreground rounded-xl bg-card">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pendingConfirmation ? "请先确认或取消上方的分析结果..." : "写下你的想法..."}
                className="flex-1 border-0 bg-transparent resize-none min-h-[40px] max-h-[100px] focus:ring-0 focus-visible:ring-0"
                rows={1}
                disabled={!!pendingConfirmation}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAITyping || !!pendingConfirmation}
              className="neo-btn p-3 rounded-xl bg-neo-yellow disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            按 Ctrl/Cmd + Enter 发送
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
