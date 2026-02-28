"use client";

import { useEffect, useRef } from "react";
import { Trash2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { STICKER_COLORS } from "@/types/sticker";

interface ColorPickerProps {
  currentColor: string;
  currentScale: number;
  currentRotation: number;
  onSelectColor: (color: string) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ColorPicker({
  currentColor,
  currentScale,
  currentRotation,
  onSelectColor,
  onScaleChange,
  onRotationChange,
  onDelete,
  onClose,
}: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleZoomIn = () => {
    const newScale = Math.min(2, currentScale + 0.2);
    onScaleChange(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.4, currentScale - 0.2);
    onScaleChange(newScale);
  };

  const handleRotate = () => {
    const newRotation = (currentRotation + 45) % 360;
    onRotationChange(newRotation);
  };

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/10"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2">
        {/* 颜色选择行 */}
        <div className="flex items-center gap-1">
          {STICKER_COLORS.map((colorItem) => (
            <button
              key={colorItem.name}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                currentColor === colorItem.color
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: colorItem.color }}
              onClick={() => onSelectColor(colorItem.color)}
              onPointerDown={(e) => e.stopPropagation()}
              title={colorItem.name}
            />
          ))}
        </div>

        {/* 缩放和旋转控制行 */}
        <div className="flex items-center justify-between gap-1 border-t pt-2">
          <div className="flex items-center gap-1">
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
              onClick={handleZoomOut}
              onPointerDown={(e) => e.stopPropagation()}
              title="缩小"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-xs text-gray-500">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
              onClick={handleZoomIn}
              onPointerDown={(e) => e.stopPropagation()}
              title="放大"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
              onClick={handleRotate}
              onPointerDown={(e) => e.stopPropagation()}
              title="旋转 45°"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-xs text-gray-500">
              {currentRotation}°
            </span>
          </div>

          <button
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 transition-transform hover:scale-110 hover:bg-red-200"
            onClick={onDelete}
            onPointerDown={(e) => e.stopPropagation()}
            title="删除贴纸"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
