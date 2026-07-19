'use client';

import React from 'react';
import { getAvatar, isImageAvatar } from '@/lib/avatars';

const ROLLER_POOL = [
  '甄嬛', '林黛玉', '乔布斯', '宫崎骏',
  '庄子', '马斯克', '贝多芬', '居里夫人',
];

const BALL_SIZE = 50;
const RADIUS = 82;

interface LoadingRollerProps {
  text: string;
}

export function LoadingRoller({ text }: LoadingRollerProps) {
  const count = ROLLER_POOL.length;

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* 滚筒容器 */}
      <div className="roller-drum">
        {/* 玻璃罩 */}
        <div className="roller-glass" />

        {/* 旋转轨道 */}
        <div className="roller-track">
          {ROLLER_POOL.map((name, i) => {
            const angle = (360 / count) * i;
            const avatar = getAvatar(name);

            return (
              <div
                key={name}
                className="roller-ball-spot"
                style={{
                  '--angle': `${angle}deg`,
                  '--radius': `${RADIUS}px`,
                  width: BALL_SIZE,
                  height: BALL_SIZE,
                  marginLeft: -(BALL_SIZE / 2),
                  marginTop: -(BALL_SIZE / 2),
                } as React.CSSProperties}
              >
                {/* 小球自身翻滚 */}
                <div
                  className="roller-ball-wobble"
                  style={{
                    '--wobble-delay': `${i * 0.25}s`,
                  } as React.CSSProperties}
                >
                  <div
                    className="rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      width: BALL_SIZE,
                      height: BALL_SIZE,
                      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent)`,
                      border: '2.5px solid rgba(255,255,255,0.6)',
                      boxShadow:
                        '0 3px 12px rgba(0,0,0,0.15), 0 0 16px rgba(255,215,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3)',
                    }}
                  >
                    {isImageAvatar(avatar) ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{avatar}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-warm-gray roller-loading-text">{text}</p>
    </div>
  );
}
