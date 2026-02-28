"use client";

import { getStickerAsset } from "@/types/sticker";

interface StickerSvgProps {
  type: string;
  fillColor: string;
  size?: number;
}

export function StickerSvg({ type, fillColor, size = 60 }: StickerSvgProps) {
  // #region agent log
  fetch('http://127.0.0.1:7496/ingest/82a79c63-4637-47d2-bd1c-f96f17e7b2ff',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6349a1'},body:JSON.stringify({sessionId:'6349a1',location:'StickerSvg.tsx:13',message:'StickerSvg render with mask',data:{type,fillColor,size},timestamp:Date.now(),hypothesisId:'color-fix'})}).catch(()=>{});
  // #endregion
  
  const asset = getStickerAsset(type);
  if (!asset) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: fillColor,
        WebkitMaskImage: `url(${asset.src})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: `url(${asset.src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
