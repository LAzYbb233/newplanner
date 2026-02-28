export interface Sticker {
  id: string;
  type: string;
  position: { x: number; y: number };
  fillColor: string;
  scale: number;
  rotation: number;
}

export interface StickerAsset {
  type: string;
  src: string;
}

export const STICKER_ASSETS: StickerAsset[] = [
  { type: "sun", src: "/image/sun.svg" },
  { type: "juice", src: "/image/juice.svg" },
];

export const STICKER_COLORS = [
  { name: "原色", color: "#000000" },
  { name: "粉色", color: "#EC4899" },
  { name: "红色", color: "#EF4444" },
  { name: "橙色", color: "#F97316" },
  { name: "黄色", color: "#EAB308" },
  { name: "绿色", color: "#22C55E" },
  { name: "青色", color: "#06B6D4" },
  { name: "蓝色", color: "#3B82F6" },
  { name: "紫色", color: "#A855F7" },
];

export function getRandomStickerType(): string {
  const index = Math.floor(Math.random() * STICKER_ASSETS.length);
  return STICKER_ASSETS[index].type;
}

export function getStickerAsset(type: string): StickerAsset | undefined {
  return STICKER_ASSETS.find((a) => a.type === type);
}

export function getRandomEdgePosition(): { x: number; y: number } {
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number;

  switch (edge) {
    case 0:
      x = Math.random() * 20;
      y = Math.random() * 80 + 10;
      break;
    case 1:
      x = 80 + Math.random() * 20;
      y = Math.random() * 80 + 10;
      break;
    case 2:
      x = Math.random() * 80 + 10;
      y = Math.random() * 15;
      break;
    case 3:
      x = Math.random() * 80 + 10;
      y = 85 + Math.random() * 15;
      break;
    default:
      x = Math.random() * 100;
      y = Math.random() * 100;
  }

  return { x, y };
}

export function createSticker(type?: string): Sticker {
  return {
    id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: type || getRandomStickerType(),
    position: getRandomEdgePosition(),
    fillColor: "#000000",
    scale: 1,
    rotation: 0,
  };
}
