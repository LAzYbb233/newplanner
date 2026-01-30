"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzingPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = sessionStorage.getItem("moodlens-pending-image");
    if (!url) {
      router.replace("/record");
      return;
    }
    setImageUrl(url);
    const t = setTimeout(() => {
      router.replace("/record/confirm");
    }, 2000);
    return () => clearTimeout(t);
  }, [router]);

  if (!imageUrl) return null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-primary/80" />
        <p className="text-lg font-medium">Analyzing...</p>
        <p className="text-sm text-muted-foreground">正在分析照片中的情绪</p>
      </div>
    </div>
  );
}
