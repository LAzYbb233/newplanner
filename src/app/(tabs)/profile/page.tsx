"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInputArea } from "@/components/chat/ChatInputArea";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { 
    messages, 
    isAITyping, 
    enableProactiveMessages,
    sendMessage, 
    initializeChat,
    toggleProactiveMessages
  } = useChatStore();
  
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current) {
      initializeChat();
      initialized.current = true;
    }
  }, []);
  
  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };
  
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* 顶部标题 */}
      <div className="shrink-0 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3 z-10 relative">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">💬</span>
              与自我对话
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              基于你的日程和心情记录的智能陪伴
            </p>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {messages.length} 条对话
          </div>
        </div>
        
        {/* AI 主动消息开关 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <label 
              htmlFor="proactive-mode" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              AI 主动关怀
            </label>
          </div>
          <Switch 
            id="proactive-mode"
            checked={enableProactiveMessages}
            onCheckedChange={toggleProactiveMessages}
          />
        </div>
      </div>
      
      {/* 对话列表区域 */}
      <div className="flex-1 overflow-y-auto relative z-0">
        <ChatMessageList messages={messages} isAITyping={isAITyping} />
      </div>
      
      {/* 输入区域 */}
      <div className="shrink-0 relative z-10">
        <ChatInputArea onSendMessage={handleSendMessage} disabled={isAITyping} />
      </div>
    </div>
  );
}
