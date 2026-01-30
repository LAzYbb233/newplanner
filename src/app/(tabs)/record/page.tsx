"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

export default function RecordPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      sessionStorage.setItem("moodlens-pending-image", url);
    } finally {
      router.push("/record/analyzing");
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <p className="text-center text-muted-foreground">
        上传一张照片，让 AI 帮你识别情绪
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        size="lg"
        className="h-16 w-16 rounded-full md:h-20 md:w-20"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-8 w-8 md:h-10 md:w-10" />
      </Button>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        从相册选择
      </Button>
    </div>
  );
}
