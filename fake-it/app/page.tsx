'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StoryModal } from '@/components/StoryModal';
import { CBTDialog } from '@/components/CBTDialog';
import { BottomBar } from '@/components/BottomBar';
import type { Bubble, RecommendItem } from '@/types';
import { matchScoreToSize, SIZE_PX, DOMAIN_COLORS } from '@/lib/colors';
import { getAvatar } from '@/lib/avatars';

const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 500;

function randomPosition(size: number) {
  const padding = size / 2 + 12;
  return {
    x: padding + Math.random() * (CANVAS_WIDTH - 2 * padding),
    y: padding + Math.random() * (CANVAS_HEIGHT - 2 * padding),
  };
}

function buildBubbles(items: RecommendItem[]): Bubble[] {
  return items.map((item): Bubble => {
    const size = matchScoreToSize(item.matchScore);
    const sizePx = SIZE_PX[size];
    const base = size === 'large' ? 18 : size === 'medium' ? 14 : 10;
    return {
      character: {
        id: item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        avatar: getAvatar(item.name),
        domain: item.domain,
        source: item.source,
        matchScore: item.matchScore,
      },
      size,
      color: DOMAIN_COLORS[item.domain] || '#FFD49E',
      position: randomPosition(sizePx),
      animationDuration: base + Math.random() * 4,
      animationDelay: -Math.random() * 10,
      isMystery: false,
      isRevealed: false,
      hasGlow: false,
    };
  });
}

export default function Page() {
  const [question, setQuestion] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [recommendCache, setRecommendCache] = useState<RecommendItem[] | null>(null);
  const [selectedCharacterName, setSelectedCharacterName] = useState<string | null>(null);
  const [cbtDomain, setCbtDomain] = useState<string>('creator');
  const [storyCharacter, setStoryCharacter] = useState<RecommendItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!question.trim()) return;
    setError(null);
    setIsLoading(true);
    setLoadingText('正在为你寻找角色...');

    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '推荐失败');
        }
        return res.json();
      })
      .then((data) => {
        const items: RecommendItem[] = data.characters;
        setRecommendCache(items);
        setBubbles(buildBubbles(items));
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : '获取角色失败');
        setIsLoading(false);
      });
  }

  function handleBubbleClick(name: string) {
    if (!recommendCache) return;
    const item = recommendCache.find((c) => c.name === name);
    if (item) setStoryCharacter(item);
  }

  function handleChat(name: string) {
    if (!recommendCache) return;
    const item = recommendCache.find((c) => c.name === name);
    if (item) setCbtDomain(item.domain);
    setStoryCharacter(null);
    setSelectedCharacterName(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 输入框 */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="你遇到了什么问题？"
            maxLength={200}
            className="input-warm flex-1 px-4 py-2.5 text-sm text-warm-black placeholder:text-warm-gray/60"
            aria-label="输入你的问题"
          />
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))',
            }}
            aria-label="提交问题"
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 px-1">{error}</p>
        )}
      </div>

      {/* 气泡区域 */}
      <div className="relative overflow-hidden flex-1" style={{ minHeight: '400px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full pulse-soft"
                  style={{
                    background: 'var(--color-philosopher)',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-warm-gray pulse-soft">{loadingText}</p>
          </div>
        )}

        {!isLoading && bubbles.length > 0 && (
          <div className="relative w-full h-full">
            {bubbles.map((b) => {
              const sz = b.size === 'large' ? 80 : b.size === 'medium' ? 60 : 44;
              return (
                <div
                  key={b.character.id}
                  className="bubble-float absolute flex items-center justify-center rounded-full cursor-pointer"
                  style={{
                    width: sz,
                    height: sz,
                    left: b.position.x - sz / 2,
                    top: b.position.y - sz / 2,
                    background: `radial-gradient(circle at 35% 30%, ${b.color}, ${b.color}dd)`,
                    fontSize: b.size === 'large' ? 32 : b.size === 'medium' ? 24 : 18,
                    border: '2px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)',
                  }}
                  onClick={() => handleBubbleClick(b.character.name)}
                >
                  {b.character.avatar}
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && bubbles.length === 0 && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="text-4xl opacity-40">🫧</div>
            <p className="text-sm text-warm-gray leading-relaxed">
              输入你的问题<br />
              让跨越时空的角色来回应你
            </p>
          </div>
        )}
      </div>

      <BottomBar />

      <StoryModal
        character={storyCharacter}
        onClose={() => setStoryCharacter(null)}
        onChat={handleChat}
      />

      <AnimatePresence>
        {selectedCharacterName && (
          <CBTDialog
            characterName={selectedCharacterName}
            question={question}
            characterDomain={cbtDomain}
            onClose={() => setSelectedCharacterName(null)}
            onError={(msg) => setError(msg)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}