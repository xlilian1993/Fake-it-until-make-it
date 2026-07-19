'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CBTModuleView } from './CBTModule';
import { getAvatar, isImageAvatar } from '@/lib/avatars';
import { DOMAIN_COLORS } from '@/lib/colors';
import type { CBTResponse, CBTModule } from '@/types';
import { downloadCBTShare } from '@/lib/shareUtils';

interface CBTDialogProps {
  characterName: string;
  question: string;
  characterDomain: string;
  onClose: () => void;
  onError?: (msg: string) => void;
  onComplete?: (data: CBTResponse) => void;
}

function Avatar({ characterName, domainColor, size = 36 }: { characterName: string; domainColor: string; size?: number }) {
  const av = getAvatar(characterName);
  return (
    <div
      className="rounded-full flex items-center justify-center text-base flex-shrink-0 self-start"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 35% 30%, ${domainColor}, ${domainColor}dd)`,
        border: '1.5px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        fontSize: size >= 36 ? '1.125rem' : '0.875rem',
      }}
    >
      {isImageAvatar(av) ? (
        <img src={av} alt={characterName} className="w-full h-full rounded-full object-cover" />
      ) : av}
    </div>
  );
}

function PastBubble({ module, domainColor, characterName }: { module: CBTModule; domainColor: string; characterName: string }) {
  return (
    <div className="flex gap-3 mb-5">
      <Avatar characterName={characterName} domainColor={domainColor} />
      <div className="flex-1 min-w-0 opacity-65">
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: '#fff' }}>
          <p className="text-sm text-warm-black leading-relaxed whitespace-pre-wrap">
            {module.content}
          </p>
        </div>
        {module.index === 5 && 'action' in module && module.action && (
          <div className="mt-2 space-y-2">
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: `${domainColor}18` }}>
              <p className="text-xs text-warm-gray mb-1">🎬 今天的排练</p>
              <p className="text-sm text-warm-black">{module.action.firstStep}</p>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: `${domainColor}18` }}>
              <p className="text-xs text-warm-gray mb-1">🎭 新台词</p>
              <p className="text-sm text-warm-black">{module.action.emergencyScript}</p>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: `${domainColor}18` }}>
              <p className="text-xs text-warm-gray mb-1">🪄 进阶剧本</p>
              <p className="text-sm text-warm-black">{module.action.backupPlan}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function splitModuleTitle(title: string): { scene: string; content: string } {
  const idx = title.indexOf('：');
  if (idx === -1) return { scene: title, content: '' };
  return { scene: title.slice(0, idx), content: title.slice(idx + 1) };
}

function StepPill({ content, state }: { content: string; state: 'past' | 'current' | 'future' }) {
  return (
    <div
      className="rounded-full px-2 py-0.5 text-center text-[10px] font-medium leading-tight transition-all duration-300"
      style={{
        background: state === 'past' ? 'rgba(0,0,0,0.08)' : state === 'current' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.05)',
        color: state === 'past' ? 'rgba(0,0,0,0.5)' : state === 'current' ? '#fff' : 'rgba(0,0,0,0.25)',
        transform: state === 'current' ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {content}
    </div>
  );
}

export function CBTDialog({ characterName, question, characterDomain, onClose, onError, onComplete }: CBTDialogProps) {
  const [cbtData, setCbtData] = useState<CBTResponse | null>(null);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [modulePhase, setModulePhase] = useState<'waiting' | 'typing' | 'done'>('waiting');
  const [isLoading, setIsLoading] = useState(true);
  const [allComplete, setAllComplete] = useState(false);
  const clickLockRef = useRef(false);

  const domainColor = (DOMAIN_COLORS as Record<string, string>)[characterDomain] || '#FFD49E';

  useEffect(() => {
    let cancelled = false;
    async function fetchCBT() {
      try {
        setIsLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/cbt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterName, question }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'CBT 调用失败');
        }
        const data: CBTResponse = await res.json();
        if (!cancelled) {
          setCbtData(data);
          setIsLoading(false);
          setCurrentModuleIdx(0);
          setModulePhase('typing');
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'CBT 获取失败';
          onError?.(msg);
          setIsLoading(false);
        }
      }
    }
    fetchCBT();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterName, question]);

  const handleTypingDone = useCallback(() => {
    setModulePhase('done');
    // 最后一步自动弹出完成页
    if (currentModuleIdx >= (cbtData?.modules?.length ?? 0) - 1) {
      const data = cbtData;
      setTimeout(() => {
        setAllComplete(true);
        if (data) onComplete?.(data);
      }, 800);
    }
  }, [cbtData, currentModuleIdx, onComplete]);

  const handleBubbleClick = useCallback(() => {
    if (isLoading || modulePhase === 'typing' || clickLockRef.current) return;
    clickLockRef.current = true;

    if (cbtData && currentModuleIdx < cbtData.modules.length - 1) {
      setCurrentModuleIdx(prev => prev + 1);
      setModulePhase('typing');
    } else {
      setAllComplete(true);
      if (cbtData) onComplete?.(cbtData);
    }

    setTimeout(() => { clickLockRef.current = false; }, 600);
  }, [isLoading, modulePhase, currentModuleIdx, cbtData, onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#EDEDED' }}
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
    >
      {/* 顶部导航栏 */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: '#EDEDED', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}
      >
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
          aria-label="返回"
        >
          <span className="text-warm-gray text-sm">←</span>
        </button>
        <div className="flex-1 text-center">
          <p className="font-heading text-sm font-semibold text-warm-black">
            {characterName}
          </p>
        </div>
        <div className="w-8" />
      </div>

      {/* 步骤指示器 */}
      {!allComplete && (
        <div className="flex-shrink-0 px-3 pt-2 pb-1">
          <p className="text-center text-xs text-warm-gray/50 italic mb-1">
            &ldquo;你此刻的心情，千百年前就有人想好了答案。&rdquo;
          </p>
          {isLoading ? null : cbtData ? (
            <>
              <div className="flex items-end justify-center gap-x-0.5">
                {cbtData.modules.map((mod, i) => {
                  let state: 'future' | 'current' | 'past';
                  if (i < currentModuleIdx || (i === currentModuleIdx && modulePhase === 'done')) {
                    state = 'past';
                  } else if (i === currentModuleIdx) {
                    state = 'current';
                  } else {
                    state = 'future';
                  }
                  const { scene, content } = splitModuleTitle(mod.title);
                  return (
                    <div key={i} className="flex flex-col items-center gap-y-0.5">
                      <span
                        className="text-[9px] leading-none transition-colors duration-300"
                        style={{ color: state === 'current' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)' }}
                      >
                        {scene}
                      </span>
                      <div className="flex items-center gap-x-0.5">
                        {i > 0 && (
                          <span
                            className="text-[9px] transition-colors duration-300"
                            style={{ color: state === 'past' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)' }}
                          >
                            →
                          </span>
                        )}
                        <StepPill content={content} state={state} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 内容区 — 聊天流 */}
      <div className="flex-1 overflow-y-auto px-4 py-4" onClick={handleBubbleClick}>
        {isLoading && (
          <div className="flex gap-3 mb-5">
            <div style={{ width: 36 }} />
            <div className="flex-1">
              <div className="rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(0,0,0,0.06)' }}>
                <div
                  className="h-full rounded-full progress-bar-shimmer"
                  style={{
                    width: '40%',
                    background: `linear-gradient(90deg, transparent, ${domainColor}cc, transparent)`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {!isLoading && cbtData && (
          <>
            {/* 已完成模块 */}
            {cbtData.modules.slice(0, currentModuleIdx).map((module, idx) => (
              <PastBubble
                key={idx}
                module={module}
                domainColor={domainColor}
                characterName={characterName}
              />
            ))}

            {/* 当前模块 */}
            {currentModuleIdx < cbtData.modules.length && (
              <div className="cursor-pointer">
                <CBTModuleView
                  module={cbtData.modules[currentModuleIdx]}
                  characterName={characterName}
                  avatarColor={domainColor}
                  startTyping={modulePhase === 'typing'}
                  onTypingDone={handleTypingDone}
                />
              </div>
            )}

            {/* 全部完成 */}
            {allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center pt-4 pb-2"
              >
                <p className="text-sm text-warm-gray mb-3">
                  对话已结束 · Fake it until you make it 🌟
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="px-6 py-2 rounded-xl bg-warm-cream text-warm-black text-sm font-medium hover:bg-warm-border transition-colors"
                  >
                    回到气泡
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cbtData) downloadCBTShare(question, characterName, cbtData.modules);
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-colors"
                    style={{ background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))' }}
                  >
                    📤 分享长图
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform"
                    aria-label="喜欢"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs shadow-sm hover:scale-110 transition-transform"
                    aria-label="不喜欢"
                  >
                    👎
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
