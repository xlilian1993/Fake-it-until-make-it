'use client';

import { useState, useCallback } from 'react';
import type { Bubble as BubbleType } from '@/types';
import { getMysteryAvatar } from '@/lib/mystery';
import { isImageAvatar } from '@/lib/avatars';
import { SIZE_PX } from '@/lib/colors';

interface MysteryBubbleProps {
  bubble: BubbleType;
  onClick: (name: string) => void;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
}

export function MysteryBubble({ bubble, onClick, onPointerDown }: MysteryBubbleProps) {
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const sizePx = SIZE_PX[bubble.size];
  const sz = sizePx >= 80 ? 80 : sizePx >= 60 ? 60 : 44;
  const mysteryFace = getMysteryAvatar();

  const handleClick = useCallback(() => {
    if (flipping) return;
    if (revealed) {
      onClick(bubble.character.name);
      return;
    }
    setFlipping(true);
    setTimeout(() => {
      setFlipping(false);
      setRevealed(true);
    }, 500);
  }, [flipping, revealed, bubble.character.name, onClick]);

  return (
    <div
      className="bubble-float absolute flex flex-col items-center select-none"
      style={{
        zIndex: 10,
        left: bubble.position.x - sz / 2,
        top: bubble.position.y - sz / 2,
        touchAction: 'none',
        '--bubble-duration': `${bubble.animationDuration}s`,
        '--bubble-delay': `${bubble.animationDelay}s`,
        '--ox': bubble.ox,
        '--oy': bubble.oy,
        '--mx': bubble.mx,
        '--my': bubble.my,
      } as React.CSSProperties}
    >
      {/* 名字标签 */}
      <span
        className="text-[10px] font-medium whitespace-nowrap mb-0.5"
        style={{ color: revealed ? 'rgba(45,42,38,0.6)' : '#D4A017', opacity: 0.9 }}
      >
        {revealed ? bubble.character.name : '✨ 今日限定'}
      </span>

      {/* 翻转卡片 */}
      <div
        className={`mystery-card ${flipping ? 'mystery-flipping' : ''} ${revealed ? 'mystery-revealed' : ''}`}
        style={{ width: sz, height: sz }}
        onPointerDown={(e) => onPointerDown(e, bubble.character.id)}
        onClick={handleClick}
      >
        <div className="mystery-card-inner">
          {/* 正面 — 神秘问号 */}
          <div
            className="mystery-card-front rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: sz, height: sz,
              background: 'radial-gradient(circle at 35% 30%, #FFD700, #E8A800)',
              boxShadow: '0 0 12px rgba(255, 215, 0, 0.4), 0 0 24px rgba(255, 215, 0, 0.2)',
            }}
          >
            <img
              src={mysteryFace}
              alt="神秘角色"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* 背面 — 真实角色头像 */}
          <div
            className="mystery-card-back rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: sz, height: sz,
              background: `radial-gradient(circle at 35% 30%, ${bubble.color}, ${bubble.color}dd)`,
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)',
              fontSize: sizePx >= 80 ? 32 : sizePx >= 60 ? 24 : 18,
            }}
          >
            {isImageAvatar(bubble.character.avatar) ? (
              <img
                src={bubble.character.avatar}
                alt={bubble.character.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span>{bubble.character.avatar}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
