"use client";

import { useState, useCallback, useRef } from "react";
import type { Sticker } from "@/types/sticker";
import { StickerSvg } from "./StickerSvg";
import { ColorPicker } from "./ColorPicker";

interface DraggableStickerProps {
  sticker: Sticker;
  containerRef: React.RefObject<HTMLDivElement>;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onColorChange: (id: string, fillColor: string) => void;
  onScaleChange: (id: string, scale: number) => void;
  onRotationChange: (id: string, rotation: number) => void;
  onDelete: (id: string) => void;
}

export function DraggableSticker({
  sticker,
  containerRef,
  onPositionChange,
  onColorChange,
  onScaleChange,
  onRotationChange,
  onDelete,
}: DraggableStickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setShowColorPicker(false);

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: sticker.position.x,
        startY: sticker.position.y,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [containerRef, sticker.position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStartRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

      const newX = Math.max(0, Math.min(90, dragStartRef.current.startX + deltaX));
      const newY = Math.max(0, Math.min(90, dragStartRef.current.startY + deltaY));

      onPositionChange(sticker.id, { x: newX, y: newY });
    },
    [isDragging, containerRef, sticker.id, onPositionChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    },
    [isDragging]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isDragging) {
        setShowColorPicker((prev) => !prev);
      }
    },
    [isDragging]
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      onColorChange(sticker.id, color);
      setShowColorPicker(false);
    },
    [sticker.id, onColorChange]
  );

  const handleScaleChange = useCallback(
    (newScale: number) => {
      onScaleChange(sticker.id, newScale);
    },
    [sticker.id, onScaleChange]
  );

  const handleRotationChange = useCallback(
    (newRotation: number) => {
      onRotationChange(sticker.id, newRotation);
    },
    [sticker.id, onRotationChange]
  );

  const handleDelete = useCallback(() => {
    onDelete(sticker.id);
    setShowColorPicker(false);
  }, [sticker.id, onDelete]);

  const handleClose = useCallback(() => {
    setShowColorPicker(false);
  }, []);

  const baseSize = 60;
  const scaledSize = baseSize * sticker.scale;
  
  // #region agent log
  fetch('http://127.0.0.1:7496/ingest/82a79c63-4637-47d2-bd1c-f96f17e7b2ff',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6349a1'},body:JSON.stringify({sessionId:'6349a1',location:'DraggableSticker.tsx:129',message:'DraggableSticker render',data:{stickerId:sticker.id,type:sticker.type,fillColor:sticker.fillColor,scale:sticker.scale,scaledSize,rotation:sticker.rotation},timestamp:Date.now(),hypothesisId:'A,C,D,E'})}).catch(()=>{});
  // #endregion

  return (
    <div
      className="absolute touch-none select-none"
      style={{
        left: `${sticker.position.x}%`,
        top: `${sticker.position.y}%`,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 100 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <div
        className={`relative transition-transform ${isDragging ? "scale-110" : "hover:scale-105"}`}
        style={{
          transform: `rotate(${sticker.rotation}deg)`,
        }}
      >
        <div className="pointer-events-none">
          <StickerSvg
            type={sticker.type}
            fillColor={sticker.fillColor}
            size={scaledSize}
          />
        </div>
      </div>

      {showColorPicker && (
        <ColorPicker
          currentColor={sticker.fillColor}
          currentScale={sticker.scale}
          currentRotation={sticker.rotation}
          onSelectColor={handleColorSelect}
          onScaleChange={handleScaleChange}
          onRotationChange={handleRotationChange}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
