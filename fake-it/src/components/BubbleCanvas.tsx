'use client';

import { Bubble } from './Bubble';
import type { Bubble as BubbleType } from '@/types';

interface BubbleCanvasProps {
  bubbles: BubbleType[];
  onBubbleClick: (name: string) => void;
}

export function BubbleCanvas({ bubbles, onBubbleClick }: BubbleCanvasProps) {
  return (
    <div
      className="relative flex-1 overflow-hidden"
      aria-label="角色气泡区域"
    >
      {/* 硬编码测试：红色方块，验证容器是否渲染 */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 rounded-full z-50" />

      {bubbles.map((bubble) => (
        <Bubble key={bubble.character.id} bubble={bubble} onClick={onBubbleClick} />
      ))}

      <div className="absolute top-2 right-2 text-xs text-warm-gray bg-white/80 px-2 py-1 rounded shadow-sm">
        {bubbles.length} 个角色
      </div>
    </div>
  );
}