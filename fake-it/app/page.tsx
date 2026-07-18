'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StoryModal } from '@/components/StoryModal';
import { CBTDialog } from '@/components/CBTDialog';
import { BottomBar } from '@/components/BottomBar';
import { RoundTableResult } from '@/components/RoundTableResult';
import type { Bubble, RecommendItem } from '@/types';
import { matchScoreToSize, SIZE_PX, DOMAIN_COLORS } from '@/lib/colors';
import { getAvatar, isImageAvatar } from '@/lib/avatars';

const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 500;
const MAX_ROUNDTABLE_MEMBERS = 3;

// Grid zones to spread bubbles apart
const ZONES = [
  { cx: 0.22, cy: 0.18 },
  { cx: 0.72, cy: 0.22 },
  { cx: 0.18, cy: 0.55 },
  { cx: 0.60, cy: 0.60 },
  { cx: 0.42, cy: 0.38 },
];

function spreadPosition(size: number, index: number) {
  const zone = ZONES[index % ZONES.length];
  const jitter = 35;
  return {
    x: Math.max(size / 2 + 8, Math.min(CANVAS_WIDTH - size / 2 - 8,
      zone.cx * CANVAS_WIDTH + (Math.random() - 0.5) * jitter * 2)),
    y: Math.max(size / 2 + 8, Math.min(CANVAS_HEIGHT - size / 2 - 8,
      zone.cy * CANVAS_HEIGHT + (Math.random() - 0.5) * jitter * 2)),
  };
}

function buildBubbles(items: RecommendItem[]): Bubble[] {
  return items.map((item, i): Bubble => {
    const size = matchScoreToSize(item.matchScore);
    const sizePx = SIZE_PX[size];
    const base = size === 'large' ? 20 : size === 'medium' ? 16 : 12;
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
      position: spreadPosition(sizePx, i),
      animationDuration: base + Math.random() * 8,
      animationDelay: -Math.random() * 12,
      ox: `${(Math.random() * 50 - 25).toFixed(1)}px`,
      oy: `${(Math.random() * -60 - 10).toFixed(1)}px`,
      mx: `${(Math.random() * 30 - 15).toFixed(1)}px`,
      my: `${(Math.random() * -50).toFixed(1)}px`,
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
  const [roundTablePerspectives, setRoundTablePerspectives] = useState<{ characterName: string; viewpoint: string; story: string }[]>([]);
  const [roundTableLoading, setRoundTableLoading] = useState(false);
  const [roundTableLoadingText, setRoundTableLoadingText] = useState('');
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [dragState, setDragState] = useState<{
    isDragging: boolean; dragId: string | null; isOverDropZone: boolean;
  }>({ isDragging: false, dragId: null, isOverDropZone: false });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  const dragIdRef = useRef<string | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  bubblesRef.current = bubbles;

  // 初始化幽灵 DOM 元素挂到 body
  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;display:none;z-index:99999;border-radius:50%;overflow:hidden;opacity:0.9;transform:scale(1.1);pointer-events:none';
    document.body.appendChild(el);
    ghostRef.current = el;
    return () => { el.remove(); ghostRef.current = null; };
  }, []);

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
        const b = bubblesRef.current.find(bb => bb.character.id === dragIdRef.current);
        if (!b || !ghostRef.current) return;
        const sz = b.size === 'large' ? 80 : b.size === 'medium' ? 60 : 44;
        let overDrop = false;
        if (dropZoneRef.current) {
          const rect = dropZoneRef.current.getBoundingClientRect();
          overDrop = ev.clientX >= rect.left && ev.clientX <= rect.right
            && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        }
        const g = ghostRef.current;
        g.style.width = g.style.height = `${sz}px`;
        g.style.left = `${ev.clientX - sz / 2}px`;
        g.style.top = `${ev.clientY - sz / 2}px`;
        g.style.background = `radial-gradient(circle at 35% 30%, ${b.color}, ${b.color}dd)`;
        g.style.fontSize = sz >= 80 ? '32px' : sz >= 60 ? '24px' : '18px';
        g.style.border = overDrop ? '3px solid var(--color-philosopher)' : '2px solid rgba(255,255,255,0.5)';
        g.style.boxShadow = overDrop ? '0 0 20px rgba(184,169,255,0.5), 0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.2)';
        g.innerHTML = isImageAvatar(b.character.avatar)
          ? `<img src="${b.character.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />`
          : b.character.avatar;
        g.style.display = '';
        setDragState({ isDragging: true, dragId: dragIdRef.current, isOverDropZone: overDrop });
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
            setRoundTableMembers(prev => {
              const next = [...prev, item];
              if (next.length > MAX_ROUNDTABLE_MEMBERS) next.shift();
              return next;
            });
          }
        }
      }
      if (ghostRef.current) ghostRef.current.style.display = 'none';
      setDragState({ isDragging: false, dragId: null, isOverDropZone: false });
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
    setRoundTableMembers([]); setRoundTablePerspectives([]);

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/recommend`, {
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

  async function handleRoundTableStart() {
    if (roundTableMembers.length < MAX_ROUNDTABLE_MEMBERS) return;
    setRoundTableLoading(true); setRoundTablePerspectives([]);
    const names = roundTableMembers.map(m => m.name);

    try {
      // 第一人（无 previous）
      setRoundTableLoadingText(`${names[0]} 正在抢麦...`);
      const r1 = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/roundtable`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterName: names[0], question }),
      });
      if (!r1.ok) { const e = await r1.json(); throw new Error(e.error); }
      const d1 = await r1.json();
      const p1 = d1.perspective;
      setRoundTablePerspectives([p1]);

      // 第二人（基于第一人）
      setRoundTableLoadingText(`${names[1]} 正在接话 ${names[0]}...`);
      const r2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/roundtable`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterName: names[1], question, previous: { name: p1.characterName, viewpoint: p1.viewpoint, story: p1.story } }),
      });
      if (!r2.ok) { const e = await r2.json(); throw new Error(e.error); }
      const d2 = await r2.json();
      const p2 = d2.perspective;
      setRoundTablePerspectives([p1, p2]);

      // 第三人（基于第二人）
      setRoundTableLoadingText(`${names[2]} 正在接话 ${names[1]}...`);
      const r3 = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/roundtable`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterName: names[2], question, previous: { name: p2.characterName, viewpoint: p2.viewpoint, story: p2.story } }),
      });
      if (!r3.ok) { const e = await r3.json(); throw new Error(e.error); }
      const d3 = await r3.json();
      const p3 = d3.perspective;
      setRoundTablePerspectives([p1, p2, p3]);

      setRoundTableLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '讨论失败');
      setRoundTableLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  const isRoundTableReady = roundTableMembers.length >= MAX_ROUNDTABLE_MEMBERS;

  return (
    <div className="flex flex-col h-full">
      {/* 输入框 */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea value={question} onChange={(e) => {
              setQuestion(e.target.value);
              const el = e.target;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown} placeholder="你遇到了什么问题？" maxLength={200} rows={1}
            className="input-warm flex-1 px-4 py-3 text-sm text-warm-black placeholder:text-warm-gray/50 rounded-2xl resize-none"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            aria-label="输入你的问题" />
          <button onClick={handleSubmit} disabled={!question.trim() || isLoading}
            className="px-5 py-3 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))', minHeight: '48px' }}
            aria-label="提交问题">
            {isLoading ? '...' : '→'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5 px-1">{error}</p>}
        {!isLoading && bubbles.length > 0 && (
          <p className="text-xs text-warm-gray/50 text-center mt-1.5">
            点击气泡聊一聊，或拖拽气泡到圆桌开始群聊
          </p>
        )}
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
            {bubbles.map((b, i) => {
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
                    '--bubble-index': i,
                    '--ox': b.ox,
                    '--oy': b.oy,
                    '--mx': b.mx,
                    '--my': b.my,
                  } as React.CSSProperties}
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

        
      {/* 圆桌区 — 三角形布局 */}
        {bubbles.length > 0 && (
          <div
            ref={dropZoneRef}
            className="absolute z-30"
            style={{
              right: '20px', bottom: '20px',
              width: '130px', height: '130px',
            }}
          >
            {/* 中心虚线圆环 */}
            <div className="absolute inset-0 rounded-full"
              style={{
                border: isRoundTableReady
                  ? '1.5px dashed rgba(184,169,255,0.35)'
                  : '1.5px dashed rgba(0,0,0,0.08)',
              }}
            />

            {/* 三个角色三角排列 */}
            {Array.from({ length: MAX_ROUNDTABLE_MEMBERS }).map((_, i) => {
              // 三点钟方向：上、右下、左下
              const angles = [-90, 30, 150]; // 上、右下、左下 各差 120°
              const angle = (angles[i] * Math.PI) / 180;
              const r = 42;
              const cx = 65, cy = 65;
              const s = 46;
              const m = roundTableMembers[i];
              const x = cx + r * Math.cos(angle) - s / 2;
              const y = cy + r * Math.sin(angle) - s / 2;
              if (m) {
                const color = DOMAIN_COLORS[m.domain] || '#FFD49E';
                return (
                  <div key={i} className="absolute rounded-full flex items-center justify-center text-lg cursor-pointer hover:scale-110 active:scale-90 transition-transform"
                    onClick={() => setRoundTableMembers(prev => prev.filter((_, j) => j !== i))}
                    title="点击移出"
                    style={{
                      width: s, height: s,
                      left: x, top: y,
                      background: `radial-gradient(circle at 35% 30%, ${color}ee, ${color})`,
                      border: '2px solid rgba(255,255,255,0.7)',
                      boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                    }}>
                    {(() => { const av = getAvatar(m.name); return isImageAvatar(av) ? <img src={av} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : av; })()}
                  </div>
                );
              }
              return (
                <div key={i} className="absolute rounded-full flex items-center justify-center"
                  style={{
                    width: s, height: s,
                    left: x, top: y,
                    border: '1.5px dashed rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                  }}>
                  <span className="text-sm text-warm-gray/20">+</span>
                </div>
              );
            })}

            {/* 中心 */}
            <div className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
              {isRoundTableReady ? (
                <button onClick={handleRoundTableStart}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 pulse-soft"
                  style={{ background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))' }}>
                  开始讨论
                </button>
              ) : roundTableMembers.length > 0 ? (
                <button onClick={() => setRoundTableMembers([])}
                  className="text-[11px] text-warm-gray/40 hover:text-warm-gray transition-colors">
                  {roundTableMembers.length}/{MAX_ROUNDTABLE_MEMBERS} · 清空
                </button>
              ) : (
                <span className="text-[11px] text-warm-gray/25">拖入</span>
              )}
            </div>
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
        perspectives={roundTablePerspectives} members={roundTableMembers}
        isLoading={roundTableLoading} loadingText={roundTableLoadingText}
        onClose={() => { setRoundTablePerspectives([]); }}
        onSelect={(name) => {
          setRoundTablePerspectives([]);
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