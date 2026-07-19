'use client';

import { useState, useEffect, useRef } from 'react';
import { getAvatar, isImageAvatar } from '@/lib/avatars';
import type { CBTModule } from '@/types';

interface CBTModuleViewProps {
  module: CBTModule;
  characterName: string;
  avatarColor: string;
  startTyping: boolean;
  onTypingDone: () => void;
}

export function CBTModuleView({ module, characterName, avatarColor, startTyping, onTypingDone }: CBTModuleViewProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  const av = getAvatar(characterName);

  // 切换模块时重置状态
  useEffect(() => {
    startedRef.current = false;
    setIsTyping(false);
    setTypingDone(false);
    setDisplayText('');
  }, [module]);

  useEffect(() => {
    if (!startTyping || startedRef.current) return;
    startedRef.current = true;
    setIsTyping(true);
    let index = 0;
    setDisplayText('');

    timerRef.current = setInterval(() => {
      if (index < module.content.length) {
        setDisplayText(module.content.slice(0, index + 1));
        index += 1;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setTypingDone(true);
        onTypingDone();
      }
    }, 20);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTyping]);

  const showAction = module.index === 5 && typingDone && 'action' in module && module.action;

  if (!startTyping && !isTyping) return null;

  return (
    <div className="module-enter flex gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 self-start"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${avatarColor}, ${avatarColor}dd)`,
          border: '1.5px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          fontSize: '1rem',
          overflow: 'hidden',
        }}
      >
        {isImageAvatar(av) ? (
          <img src={av} alt={characterName} className="w-full h-full rounded-full object-cover" />
        ) : av}
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: '#fff' }}>
          <p className="text-sm text-warm-black leading-relaxed whitespace-pre-wrap">
            {displayText}
            {!typingDone && (
              <span className="inline-block w-0.5 h-4 bg-warm-gray ml-0.5 pulse-soft align-middle" />
            )}
          </p>
        </div>

        {showAction && (
          <div className="mt-2 space-y-2 fade-in-up">
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: `${avatarColor}18` }}>
              <p className="text-xs text-warm-gray mb-1">🎬 今天的排练</p>
              <p className="text-sm text-warm-black">{module.action!.firstStep}</p>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: `${avatarColor}18` }}>
              <p className="text-xs text-warm-gray mb-1">🎭 新台词</p>
              <p className="text-sm text-warm-black">{module.action!.emergencyScript}</p>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: `${avatarColor}18` }}>
              <p className="text-xs text-warm-gray mb-1">🪄 进阶剧本</p>
              <p className="text-sm text-warm-black">{module.action!.backupPlan}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
