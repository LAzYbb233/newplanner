import type { PendingAnalysis } from "@/types/todo";

const OFFLINE_QUEUE_KEY = "moodlens_offline_queue";

export function getOfflineQueue(): PendingAnalysis[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(content: string): PendingAnalysis {
  const queue = getOfflineQueue();
  
  const item: PendingAnalysis = {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    content,
    createdAt: Date.now(),
    synced: false,
  };
  
  queue.push(item);
  
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save to offline queue:", error);
  }
  
  return item;
}

export function removeFromOfflineQueue(id: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to update offline queue:", error);
  }
}

export function markAsSynced(id: string): void {
  const queue = getOfflineQueue();
  const updated = queue.map(item => 
    item.id === id ? { ...item, synced: true } : item
  );
  
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update offline queue:", error);
  }
}

export function clearSyncedItems(): void {
  const queue = getOfflineQueue();
  const pending = queue.filter(item => !item.synced);
  
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error("Failed to clear synced items:", error);
  }
}

export function getPendingCount(): number {
  return getOfflineQueue().filter(item => !item.synced).length;
}

export function setupOnlineListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  
  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}

export async function syncOfflineQueue(
  analyzeAndConfirm: (content: string) => Promise<void>
): Promise<{ success: number; failed: number }> {
  const queue = getOfflineQueue().filter(item => !item.synced);
  
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }
  
  let success = 0;
  let failed = 0;
  
  for (const item of queue) {
    try {
      await analyzeAndConfirm(item.content);
      markAsSynced(item.id);
      success++;
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      failed++;
    }
  }
  
  clearSyncedItems();
  
  return { success, failed };
}
