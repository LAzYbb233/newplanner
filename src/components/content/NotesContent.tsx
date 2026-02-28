"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useJournalStore } from "@/store/journalStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const MOOD_EMOJIS = ["💭", "✨", "🌟", "💡", "😊", "🎉", "💪", "🌈", "❤️", "🔥"];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface Note {
  id: string;
  content: string;
  emoji: string;
  timestamp: number;
}

export function NotesContent() {
  const dateKey = formatDate(new Date());
  const dailyNote = useJournalStore((s) => s.dailyNotes.find((n) => n.date === dateKey));
  const updateDailyNote = useJournalStore((s) => s.updateDailyNote);
  
  const [selectedEmoji, setSelectedEmoji] = useState<string>("💭");
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  
  const handlePublish = useCallback(() => {
    if (noteContent.trim()) {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: noteContent.trim(),
        emoji: selectedEmoji,
        timestamp: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      
      const allContent = [noteContent.trim(), dailyNote?.content || ""]
        .filter(Boolean)
        .join("\n\n");
      updateDailyNote(dateKey, allContent);
      
      setNoteContent("");
    }
  }, [noteContent, selectedEmoji, dateKey, dailyNote, updateDailyNote]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handlePublish();
    }
  }, [handlePublish]);
  
  return (
    <div className="space-y-4">
      {/* 输入区域 */}
      <Card className="neo-card">
        <CardHeader className="border-b-4 border-foreground bg-neo-pink rounded-t-lg">
          <CardTitle className="text-xl font-black">随手记</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Emoji 选择 */}
          <div className="flex flex-wrap gap-2">
            {MOOD_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`neo-btn p-2 rounded-lg text-xl ${
                  selectedEmoji === emoji ? "bg-neo-yellow" : "bg-card"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          {/* 输入框 */}
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="记录今天的小确幸、感悟或想法..."
            className="neo-input min-h-[100px] resize-none"
          />
          
          {/* 发布按钮 */}
          <div className="flex justify-end">
            <button
              onClick={handlePublish}
              disabled={!noteContent.trim()}
              className="neo-btn flex items-center gap-2 px-6 py-2 rounded-lg bg-neo-green disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              发布
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* 记录列表 */}
      {notes.length === 0 ? (
        <Card className="neo-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            还没有任何记录，开始写点什么吧！
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="neo-card">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{note.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.timestamp).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
