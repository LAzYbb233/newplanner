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
  }, [initializeChat]);
  
  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };
  
  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen flex-col relative overflow-hidden mx-auto max-w-3xl">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-lavender/30 via-transparent to-accent-mint/20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent-lavender/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-cream/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* 顶部标题 */}
      <div className="shrink-0 border-b-2 border-foreground/20 bg-card/80 backdrop-blur-sm px-4 py-3 z-10 relative rounded-b-2xl mx-2 mt-2">
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
          <div className="text-xs px-3 py-1 rounded-full bg-foreground text-card font-medium">
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
