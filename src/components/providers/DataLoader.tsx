"use client";

import { useEffect } from "react";
import { useJournalStore } from "@/store/journalStore";

export function DataLoader({ children }: { children: React.ReactNode }) {
  const loadData = useJournalStore((s) => s.loadData);
  const isInitialized = useJournalStore((s) => s.isInitialized);
  const isLoading = useJournalStore((s) => s.isLoading);

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      loadData();
    }
  }, [loadData, isInitialized, isLoading]);

  // 可以在这里显示加载状态，但为了用户体验，我们允许立即渲染
  // 数据会在后台加载完成后更新
  return <>{children}</>;
}
