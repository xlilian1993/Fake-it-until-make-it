'use client';

import { useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StoryModal } from '@/components/StoryModal';
import { CBTDialog } from '@/components/CBTDialog';
import { BottomBar } from '@/components/BottomBar';
import { RoundTable } from '@/components/RoundTable';
import { RoundTableResult } from '@/components/RoundTableResult';
import type { Bubble, RecommendItem, RoundTableResponse } from '@/types';
import { matchScoreToSize, SIZE_PX, DOMAIN_COLORS } from '@/lib/colors';
import { getAvatar, isImageAvatar } from '@/lib/avatars';

const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 500;
const MAX_ROUNDTABLE_MEMBERS = 3;

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

  const [roundTableMembers, setRoundTableMembers] = useState<RecommendItem[]>([]);
  const [roundTableData, setRoundTableData] = useState<RoundTableResponse | null>(null);
  const [roundTableLoading, setRoundTableLoading] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [dragState, setDragState] = useState<{
    isDragging: boolean; dragId: string | null;
    position: { x: number; y: number } | null; isOverDropZone: boolean;
  }>({ isDragging: false, dragId: null, position: null, isOverDropZone: false });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  const dragIdRef = useRef<string | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
    dragIdRef.current = id;

    const onMove = (ev: PointerEvent) => {
      if (!startPos.current) return;
      const dx = Math.abs(ev.clientX - startPos.current.x);
      const dy = Math.abs(ev.clientY - startPos.current.y);
      if (dx > 5 || dy > 5) hasMoved.current = true;

      if (hasMoved.current) {
        let overDrop = false;
        if (dropZoneRef.current) {
          const rect = dropZoneRef.current.getBoundingClientRect();
          overDrop = ev.clientX >= rect.left && ev.clientX <= rect.right
            && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        }
        setDragState({
          isDragging: true, dragId: dragIdRef.current,
          position: { x: ev.clientX, y: ev.clientY }, isOverDropZone: overDrop,
        });
      }
    };

    const onUp = (ev: PointerEvent) => {
      if (hasMoved.current && dragIdRef.current) {
        let overDrop = false;
        if (dropZoneRef.current) {
          const rect = dropZoneRef.current.getBoundingClientRect();
          overDrop = ev.clientX >= rect.left && ev.clientX <= rect.right
            && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        }
        if (overDrop && recommendCache) {
          const item = recommendCache.find(
            c => c.name.toLowerCase().replace(/\s+/g, '-') === dragIdRef.current
          );
          if (item && !roundTableMembers.find(m => m.name === item.name)) {
            setRoundTableMembers(prev => [...prev, item]);
          }
        }
      }
      setDragState({ isDragging: false, dragId: null, position: null, isOverDropZone: false });
      startPos.current = null;
      hasMoved.current = false;
      dragIdRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendCache, roundTableMembers]);

  function handleSubmit() {
    if (!question.trim()) return;
    setError(null); setIsLoading(true); setLoadingText('正在为你寻找角色...');
    setRoundTableMembers([]); setRoundTableData(null);

    fetch('/api/recommend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
      .then(async (res) => { if (!res.ok) { const e = await res.json(); throw new Error(e.error || '推荐失败'); } return res.json(); })
      .then((data) => { setRecommendCache(data.characters); setBubbles(buildBubbles(data.characters)); setIsLoading(false); })
      .catch((e) => { setError(e instanceof Error ? e.message : '获取角色失败'); setIsLoading(false); });
  }

  function handleBubbleClick(name: string) {
    if (!recommendCache) return;
    const item = recommendCache.find(c => c.name === name);
    if (item) setStoryCharacter(item);
  }

  function handleChat(name: string) {
    if (!recommendCache) return;
    const item = recommendCache.find(c => c.name === name);
    if (item) setCbtDomain(item.domain);
    setStoryCharacter(null); setSelectedCharacterName(name);
  }

  function handleRoundTableStart() {
    if (roundTableMembers.length < MAX_ROUNDTABLE_MEMBERS) return;
    setRoundTableLoading(true); setRoundTableData(null);
    fetch('/api/roundtable', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterNames: roundTableMembers.map(m => m.name), question }),
    })
      .then(async (res) => { if (!res.ok) { const e = await res.json(); throw new Error(e.error || '讨论失败'); } return res.json(); })
      .then((data: RoundTableResponse) => { setRoundTableData(data); setRoundTableLoading(false); })
      .catch((e) => { setError(e instanceof Error ? e.message : '讨论失败'); setRoundTableLoading(false); });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  const isRoundTableReady = roundTableMembers.length >= MAX_ROUNDTABLE_MEMBERS;

  return (
    <div className="flex flex-col h-full">
      {/* 输入框 */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="flex gap-2">
          <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="你遇到了什么问题？" maxLength={200}
            className="input-warm flex-1 px-4 py-2.5 text-sm text-warm-black placeholder:text-warm-gray/60"
            aria-label="输入你的问题" />
          <button onClick={handleSubmit} disabled={!question.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))' }}
            aria-label="提交问题">
            {isLoading ? '...' : '→'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2 px-1">{error}</p>}
      </div>

      {/* 气泡区域 + 圆桌（同一个 relative 容器） */}
      <div className="relative flex-1" style={{ minHeight: '400px' }}>
        {/* 气泡 */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full pulse-soft"
                  style={{ background: 'var(--color-philosopher)', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-sm text-warm-gray pulse-soft">{loadingText}</p>
          </div>
        )}

        {!isLoading && bubbles.length > 0 && (
          <div className="absolute inset-0">
            {bubbles.map((b) => {
              const sz = b.size === 'large' ? 80 : b.size === 'medium' ? 60 : 44;
              const isInRoundTable = roundTableMembers.some(m => m.name === b.character.name);
              return (
                <div key={b.character.id}
                  className="bubble-float absolute flex items-center justify-center rounded-full cursor-pointer overflow-hidden select-none"
                  style={{
                    width: sz, height: sz,
                    left: b.position.x - sz / 2, top: b.position.y - sz / 2,
                    background: `radial-gradient(circle at 35% 30%, ${b.color}, ${b.color}dd)`,
                    fontSize: b.size === 'large' ? 32 : b.size === 'medium' ? 24 : 18,
                    border: '2px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)',
                    opacity: isInRoundTable ? 0.4 : 1,
                    touchAction: 'none',
                  }}
                  onPointerDown={(e) => handlePointerDown(e, b.character.id)}
                  onClick={() => { if (!isInRoundTable) handleBubbleClick(b.character.name); }}
                >
                  {isImageAvatar(b.character.avatar) ? (
                    <img src={b.character.avatar} alt={b.character.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1em' }}>{b.character.avatar}</span>
                  )}
                </div>
              );
            })}

            {/* 拖拽幽灵 */}
            {dragState.isDragging && dragState.dragId && dragState.position && (() => {
              const b = bubbles.find(bb => bb.character.id === dragState.dragId);
              if (!b) return null;
              const sz = b.size === 'large' ? 80 : b.size === 'medium' ? 60 : 44;
              return (
                <div className="fixed pointer-events-none z-50 flex items-center justify-center rounded-full"
                  style={{
                    width: sz, height: sz,
                    left: dragState.position.x - sz / 2, top: dragState.position.y - sz / 2,
                    background: `radial-gradient(circle at 35% 30%, ${b.color}, ${b.color}dd)`,
                    fontSize: b.size === 'large' ? 32 : b.size === 'medium' ? 24 : 18,
                    border: dragState.isOverDropZone ? '3px solid var(--color-philosopher)' : '2px solid rgba(255,255,255,0.5)',
                    boxShadow: dragState.isOverDropZone
                      ? '0 0 20px rgba(184,169,255,0.5), 0 4px 12px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(0,0,0,0.2)',
                    opacity: 0.9, transform: 'scale(1.1)',
                  }}>
                  {isImageAvatar(b.character.avatar) ? (
                    <img src={b.character.avatar} alt={b.character.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1em' }}>{b.character.avatar}</span>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {!isLoading && bubbles.length === 0 && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="text-4xl opacity-40">🫧</div>
            <p className="text-sm text-warm-gray leading-relaxed">
              输入你的问题<br />让跨越时空的角色来回应你
            </p>
          </div>
        )}

        
      {/* 圆桌区 */}
        {bubbles.length > 0 && (
          <div
            ref={dropZoneRef}
            className="absolute bottom-3 right-3 z-30 rounded-2xl p-3"
            style={{
              width: '120px',
              background: isRoundTableReady ? 'rgba(184,169,255,0.25)' : 'rgba(0,0,0,0.08)',
              border: isRoundTableReady ? '2px dashed var(--color-philosopher)' : '2px dashed rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p className="text-xs text-warm-gray text-center mb-2 font-medium">
              🔵 圆桌 {roundTableMembers.length}/{MAX_ROUNDTABLE_MEMBERS}
            </p>
            <div className="flex flex-col gap-2 items-center">
              {Array.from({ length: MAX_ROUNDTABLE_MEMBERS }).map((_, i) => {
                const m = roundTableMembers[i];
                if (m) {
                  const color = DOMAIN_COLORS[m.domain] || '#FFD49E';
                  return (
                    <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle at 35% 30%, ${color}, ${color}dd)`,
                        border: '2px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}>
                      {(() => { const av = getAvatar(m.name); return isImageAvatar(av) ? <img src={av} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : av; })()}
                    </div>
                  );
                }
                return (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
                    <span className="text-xs text-warm-gray/40">+</span>
                  </div>
                );
              })}
            </div>
            {isRoundTableReady ? (
              <button onClick={handleRoundTableStart}
                className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90 active:scale-95 pulse-soft"
                style={{ background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))' }}>
                开始讨论
              </button>
            ) : roundTableMembers.length > 0 ? (
              <button onClick={() => setRoundTableMembers([])}
                className="w-full mt-3 py-1.5 rounded-lg text-xs text-warm-gray hover:text-warm-black transition-colors">
                清空
              </button>
            ) : null}
          </div>
        )}
      </div>

      <BottomBar />

      <StoryModal character={storyCharacter} onClose={() => setStoryCharacter(null)} onChat={handleChat} />

      <AnimatePresence>
        {selectedCharacterName && (
          <CBTDialog characterName={selectedCharacterName} question={question}
            characterDomain={cbtDomain} onClose={() => setSelectedCharacterName(null)}
            onError={(msg) => setError(msg)} />
        )}
      </AnimatePresence>

      <RoundTableResult
        data={roundTableData} members={roundTableMembers} isLoading={roundTableLoading}
        onClose={() => { setRoundTableData(null); }}
        onSelect={(name) => {
          setRoundTableData(null);
          if (recommendCache) {
            const item = recommendCache.find(c => c.name === name);
            if (item) setCbtDomain(item.domain);
          }
          setSelectedCharacterName(name);
        }}
      />
    </div>
  );
}