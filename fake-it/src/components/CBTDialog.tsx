'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CBTModuleView } from './CBTModule';
import { getAvatar } from '@/lib/avatars';
import { DOMAIN_COLORS } from '@/lib/colors';
import type { CBTResponse, CBTModule } from '@/types';

interface CBTDialogProps {
  characterName: string;
  question: string;
  characterDomain: string;
  onClose: () => void;
  onError?: (msg: string) => void;
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
        const res = await fetch('/api/cbt', {
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
      className="absolute inset-0 z-50 flex flex-col bg-warm-white"
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
    >
      {/* 顶部角色栏 */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-warm-border)' }}
      >
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-warm-cream flex items-center justify-center hover:bg-warm-border transition-colors"
          aria-label="返回"
        >
          <span className="text-warm-gray text-sm">←</span>
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${domainColor} 0%, ${domainColor}cc 100%)`,
            border: '2px solid rgba(255,255,255,0.6)',
          }}
        >
          {getAvatar(characterName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-medium text-warm-black truncate">
            {characterName}
          </p>
          <p className="text-xs text-warm-gray truncate">
            {question}
          </p>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-full pulse-soft flex items-center justify-center text-2xl"
              style={{ background: `${domainColor}33` }}
            >
              {getAvatar(characterName)}
            </div>
            <p className="text-sm text-warm-gray pulse-soft">
              正在思考...
            </p>
          </div>
        )}

        {!isLoading && cbtData && (
          <div className="space-y-6">
            {cbtData.modules.slice(0, currentModuleIdx + 1).map((module: CBTModule, idx: number) => (
              <div key={idx}>
                {idx < currentModuleIdx ? (
                  <div className="opacity-70">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-philosopher/20 text-xs font-medium text-warm-black">
                        {module.index}
                      </span>
                      <h4 className="font-heading text-sm font-medium text-warm-black">
                        {module.title}
                      </h4>
                    </div>
                    <p className="text-sm text-warm-black leading-relaxed whitespace-pre-wrap pl-8">
                      {module.content}
                    </p>
                    {module.index === 5 && 'action' in module && module.action && (
                      <div className="mt-3 space-y-2 pl-8">
                        <div className="bg-warm-cream rounded-lg p-3">
                          <p className="text-xs text-warm-gray mb-1">📍 今天的第一步</p>
                          <p className="text-sm text-warm-black">{module.action.firstStep}</p>
                        </div>
                        <div className="bg-warm-cream rounded-lg p-3">
                          <p className="text-xs text-warm-gray mb-1">💬 应急话术</p>
                          <p className="text-sm text-warm-black">{module.action.emergencyScript}</p>
                        </div>
                        <div className="bg-warm-cream rounded-lg p-3">
                          <p className="text-xs text-warm-gray mb-1">🔄 备选方案</p>
                          <p className="text-sm text-warm-black">{module.action.backupPlan}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <CBTModuleView module={module} onComplete={handleModuleComplete} />
                )}
              </div>
            ))}

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
          </div>
        )}
      </div>
    </motion.div>
  );
}