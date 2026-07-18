'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getAvatar, isImageAvatar } from '@/lib/avatars';
import { DOMAIN_COLORS } from '@/lib/colors';
import type { RecommendItem } from '@/types';

interface Perspective {
  characterName: string;
  viewpoint: string;
  story: string;
}

interface RoundTableResultProps {
  perspectives: Perspective[];
  members: RecommendItem[];
  isLoading: boolean;
  loadingText: string;
  onClose: () => void;
  onSelect: (name: string) => void;
}

export function RoundTableResult({ perspectives, members, isLoading, loadingText, onClose, onSelect }: RoundTableResultProps) {
  const isOpen = perspectives.length > 0 || isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          <motion.div
            className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[85%] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-warm-cream flex items-center justify-center hover:bg-warm-border transition-colors"
                aria-label="关闭"
              >
                <span className="text-warm-gray text-lg leading-none">✕</span>
              </button>

              <h2 className="font-heading text-lg text-warm-black mb-1">圆桌讨论</h2>
              <p className="text-sm text-warm-gray/40 mb-5">前排吃瓜 ing 🍉</p>

              {/* 已展示的角色 */}
              {perspectives.map((p, idx) => {
                const member = members.find(m => m.name === p.characterName);
                const color = member ? DOMAIN_COLORS[member.domain] : '#FFD49E';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-xl p-4 mb-3"
                    style={{ background: `${color}15` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, ${color}, ${color}dd)`,
                          border: '2px solid rgba(255,255,255,0.6)',
                        }}
                      >
                        {(() => {
                          const av = getAvatar(p.characterName);
                          return isImageAvatar(av) ? (
                            <img src={av} alt={p.characterName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : av;
                        })()}
                      </div>
                      <div>
                        <p className="font-heading text-sm font-medium text-warm-black">{p.characterName}</p>
                        <p className="text-xs text-warm-gray">第 {idx + 1} 位发言</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-warm-gray mb-1">💡 观点</p>
                      <p className="text-sm text-warm-black leading-relaxed">{p.viewpoint}</p>
                    </div>
                    <div>
                      <p className="text-xs text-warm-gray mb-1">📖 经历</p>
                      <p className="text-sm text-warm-black leading-relaxed">{p.story}</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading 下一个角色 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl p-4 mb-3 flex items-center gap-3"
                  style={{ background: 'rgba(0,0,0,0.04)' }}
                >
                  <div className="w-10 h-10 rounded-full pulse-soft flex items-center justify-center"
                    style={{ background: 'var(--color-philosopher)' }}>
                    <span className="text-white text-sm">...</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-warm-gray pulse-soft">{loadingText}</p>
                  </div>
                </motion.div>
              )}

              {/* 全部完成：选 1 人深入 */}
              {perspectives.length === 3 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="pt-2"
                >
                  <p className="text-sm text-warm-gray text-center mb-3">想和谁深入聊聊？</p>
                  <div className="flex gap-2 justify-center">
                    {perspectives.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => onSelect(p.characterName)}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))',
                        }}
                      >
                        {p.characterName}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}