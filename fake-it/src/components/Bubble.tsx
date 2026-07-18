'use client';

import type { Bubble as BubbleType } from '@/types';
import { SIZE_PX, SIZE_TOUCH } from '@/lib/colors';

interface BubbleProps {
  bubble: BubbleType;
  onClick: (name: string) => void;
}

export function Bubble({ bubble, onClick }: BubbleProps) {
  const sizePx = SIZE_PX[bubble.size];
  const touchSize = SIZE_TOUCH[bubble.size];

  return (
    <button
      type="button"
      className="bubble-float bubble-shadow absolute flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-philosopher/50 active:scale-90"
      style={{
        width: touchSize,
        height: touchSize,
        left: bubble.position.x - touchSize / 2,
        top: bubble.position.y - touchSize / 2,
        background: `radial-gradient(circle at 35% 30%, ${bubble.color}ee 0%, ${bubble.color} 70%, ${bubble.color}cc 100%)`,
        fontSize: sizePx >= 80 ? 32 : sizePx >= 60 ? 24 : 18,
        border: '2px solid rgba(255,255,255,0.5)',
      } as React.CSSProperties}
      onClick={() => onClick(bubble.character.name)}
      aria-label={`角色 ${bubble.character.name}`}
    >
      <span style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
        {bubble.character.avatar}
      </span>
    </button>
  );
}