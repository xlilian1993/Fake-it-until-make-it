'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { RecommendItem } from '@/types';
import { getAvatar, isImageAvatar } from '@/lib/avatars';
import { DOMAIN_COLORS } from '@/lib/colors';

interface StoryModalProps {
  character: RecommendItem | null;
  onClose: () => void;
  onChat: (name: string) => void;
  onAddToRoundTable: (name: string) => void;
}

export function StoryModal({ character, onClose, onChat, onAddToRoundTable }: StoryModalProps) {
  const isOpen = !!character;

  return (
    <AnimatePresence>
      {isOpen && character && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${character.name} 的故事`}
        >
          {/* 背景模糊 */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* 浮窗 */}
          <motion.div
            className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[80%] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
            }}
          >
            {/* 顶部色条 */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${DOMAIN_COLORS[character.domain] || '#B8A9FF'}, ${(DOMAIN_COLORS[character.domain] || '#B8A9FF')}88)`,
              }}
            />

            <div className="p-5">
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-warm-cream flex items-center justify-center hover:bg-warm-border transition-colors"
                aria-label="关闭浮窗"
              >
                <span className="text-warm-gray text-lg leading-none">✕</span>
              </button>

              {/* 人物介绍 */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${DOMAIN_COLORS[character.domain] || '#B8A9FF'} 0%, ${(DOMAIN_COLORS[character.domain] || '#B8A9FF')}cc 100%)`,
                    border: '2px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {(() => {
                    const av = getAvatar(character.name);
                    return isImageAvatar(av) ? (
                      <img src={av} alt={character.name} className="w-full h-full rounded-full object-cover" />
                    ) : av;
                  })()}
                </div>
                <div>
                  <h2 className="font-heading text-xl text-warm-black leading-tight">
                    {character.story?.intro?.name || character.name}
                  </h2>
                  <p className="text-sm text-warm-gray mt-0.5">
                    {character.story?.intro?.source || ''}
                  </p>
                </div>
              </div>

              {/* 一句话标签 */}
              {character.story?.intro?.tagline && (
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm mb-5"
                  style={{
                    background: `${DOMAIN_COLORS[character.domain] || '#B8A9FF'}33`,
                    color: '#2D2A26',
                  }}
                >
                  {character.story.intro.tagline}
                </div>
              )}

              {/* 多面人生 */}
              {character.story?.facets && character.story.facets.length > 0 && (
              <div className="mb-5">
                <h3 className="font-heading text-sm text-warm-gray mb-3 tracking-wide">
                  多面人生
                </h3>
                <div className="space-y-4">
                  {character.story.facets.map((facet, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.15, duration: 0.4 }}
                      className="border-l-2 pl-3"
                      style={{
                        borderColor: DOMAIN_COLORS[character.domain] || '#B8A9FF',
                      }}
                    >
                      <p className="text-sm font-medium text-warm-black mb-1">
                        {facet.label}
                      </p>
                      <p className="text-sm text-warm-gray leading-relaxed">
                        {facet.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => onChat(character.name)}
                  className="flex-1 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))`,
                    boxShadow: '0 4px 12px rgba(184,169,255,0.33)',
                  }}
                >
                  💬 和 Ta 聊
                </button>
                <button
                  onClick={() => onAddToRoundTable(character.name)}
                  className="flex-1 py-3 rounded-xl font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: 'rgba(184,169,255,0.12)',
                    color: 'var(--color-philosopher)',
                    border: '1px solid rgba(184,169,255,0.25)',
                  }}
                >
                  👥 拉Ta群聊
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
