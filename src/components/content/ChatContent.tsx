"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, User } from "lucide-react";

export function ChatContent() {
  const { 
    messages, 
    isAITyping, 
    sendMessage, 
    initializeChat
  } = useChatStore();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current) {
      initializeChat();
      initialized.current = true;
    }
  }, [initializeChat]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSend = useCallback(async () => {
    if (input.trim() && !isAITyping) {
      const message = input.trim();
      setInput("");
      await sendMessage(message);
    }
  }, [input, isAITyping, sendMessage]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  }, [handleSend]);
  
  return (
    <div className="space-y-4">
      {/* 标题卡片 */}
      <Card className="neo-card">
        <CardHeader className="border-b-4 border-foreground bg-neo-blue rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black">Insight Yourself</CardTitle>
{/* 清空按钮暂时隐藏，等待 store 支持 */}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <h3 className="font-bold text-lg mb-2">与自己对话</h3>
          <p className="text-muted-foreground text-sm">
            这是你与自己内心的对话空间
            <br />
            写下你的想法、困惑或感悟
            <br />
            让我们一起探索你的内心世界
          </p>
        </CardContent>
      </Card>
      
      {/* 对话区域 */}
      <Card className="neo-card">
        <CardContent className="py-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                开始与自己对话吧...
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
            {isAITyping && (
              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-lg border-2 border-foreground bg-neo-purple flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="p-3 rounded-lg border-2 border-foreground bg-card neo-shadow-sm">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 输入区域 */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 p-2 border-4 border-foreground rounded-xl bg-card">
              <button className="neo-btn p-2 rounded-lg bg-neo-green text-sm font-bold">
                现在的我
              </button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="写下你的想法..."
                className="flex-1 border-0 bg-transparent resize-none min-h-[40px] max-h-[100px] focus:ring-0 focus-visible:ring-0"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAITyping}
              className="neo-btn p-3 rounded-xl bg-neo-yellow disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
