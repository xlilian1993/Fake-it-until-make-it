'use client';

import { forwardRef } from 'react';
import { getAvatar, isImageAvatar } from '@/lib/avatars';
import type { RecommendItem } from '@/types';
import { DOMAIN_COLORS } from '@/lib/colors';

interface RoundTableProps {
  members: RecommendItem[];
  maxMembers: number;
  isReady: boolean;
  onClear: () => void;
  onStart: () => void;
}

export const RoundTable = forwardRef<HTMLDivElement, RoundTableProps>(
  function RoundTable({ members, maxMembers, isReady, onClear, onStart }, ref) {
    return (
      <div
        ref={ref}
        className="absolute bottom-3 right-3 z-30 transition-all"
        style={{
          width: '120px',
        }}
      >
        {/* 圆桌区域 */}
        <div
          className="rounded-2xl p-3 transition-all"
          style={{
            background: isReady
              ? 'rgba(184, 169, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.06)',
            border: isReady
              ? '2px dashed var(--color-philosopher)'
              : '2px dashed rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* 标题 */}
          <p className="text-xs text-warm-gray text-center mb-2 font-medium">
            圆桌 {members.length}/{maxMembers}
          </p>

          {/* 成员槽位 */}
          <div className="flex flex-col gap-2 items-center">
            {Array.from({ length: maxMembers }).map((_, i) => {
              const member = members[i];
              if (member) {
                const color = DOMAIN_COLORS[member.domain] || '#FFD49E';
                return (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${color}, ${color}dd)`,
                      border: '2px solid rgba(255,255,255,0.6)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {(() => {
                      const av = getAvatar(member.name);
                      return isImageAvatar(av) ? (
                        <img src={av} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : av;
                    })()}
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: 'rgba(0,0,0,0.12)' }}
                >
                  <span className="text-xs text-warm-gray/40">+</span>
                </div>
              );
            })}
          </div>

          {/* 按钮 */}
          {isReady ? (
            <button
              onClick={onStart}
              className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95 pulse-soft"
              style={{
                background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))',
              }}
            >
              开始讨论
            </button>
          ) : (
            members.length > 0 && (
              <button
                onClick={onClear}
                className="w-full mt-3 py-1.5 rounded-lg text-xs text-warm-gray hover:text-warm-black transition-colors"
              >
                清空
              </button>
            )
          )}
        </div>
      </div>
    );
  }
);
