'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CBTModuleView } from './CBTModule';
import { getAvatar, isImageAvatar } from '@/lib/avatars';
import { DOMAIN_COLORS } from '@/lib/colors';
import type { CBTResponse, CBTModule } from '@/types';

interface CBTDialogProps {
  characterName: string;
  question: string;
  characterDomain: string;
  onClose: () => void;
  onError?: (msg: string) => void;
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
        <p className="text-[11px] text-warm-gray/35 mb-1 px-1">
          {module.title}
        </p>
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

export function CBTDialog({ characterName, question, characterDomain, onClose, onError }: CBTDialogProps) {
  const [cbtData, setCbtData] = useState<CBTResponse | null>(null);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allComplete, setAllComplete] = useState(false);

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

  const handleModuleComplete = () => {
    if (!cbtData) return;
    if (currentModuleIdx < cbtData.modules.length - 1) {
      setTimeout(() => {
        setCurrentModuleIdx(prev => prev + 1);
      }, 1000);
    } else {
      setAllComplete(true);
    }
  };

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

      {/* 内容区 — 聊天流 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex gap-3 mb-5">
            <Avatar characterName={characterName} domainColor={domainColor} />
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: '#fff' }}>
              <p className="text-sm text-warm-gray pulse-soft">
                正在为你改写剧本...
              </p>
            </div>
          </div>
        )}

        {!isLoading && cbtData && (
          <>
            {/* 开场白 — 始终在顶部 */}
            <motion.div
              className="flex gap-3 mb-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.65, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Avatar characterName={characterName} domainColor={domainColor} />
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm" style={{ background: '#fff' }}>
                  <p className="text-sm text-warm-black leading-relaxed">
                    让我帮你改编你的人生剧本吧
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 已完成模块（聊天气泡） */}
            {cbtData.modules.slice(0, currentModuleIdx).map((module, idx) => (
              <PastBubble
                key={idx}
                module={module}
                domainColor={domainColor}
                characterName={characterName}
              />
            ))}

            {/* 当前正在输出的模块 */}
            {currentModuleIdx < cbtData.modules.length && (
              <CBTModuleView
                module={cbtData.modules[currentModuleIdx]}
                characterName={characterName}
                avatarColor={domainColor}
                onComplete={handleModuleComplete}
              />
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
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-warm-cream text-warm-black text-sm font-medium hover:bg-warm-border transition-colors"
                >
                  回到气泡
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
