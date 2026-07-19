'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StoryModal } from '@/components/StoryModal';
import { CBTDialog } from '@/components/CBTDialog';
import { BottomBar } from '@/components/BottomBar';
import { RoundTableResult } from '@/components/RoundTableResult';
import { MysteryBubble } from '@/components/MysteryBubble';
import { ShareImageModal } from '@/components/ShareImageModal';
import type { Bubble, RecommendItem, CBTResponse } from '@/types';
import { matchScoreToSize, SIZE_PX, DOMAIN_COLORS } from '@/lib/colors';
import { getAvatar, isImageAvatar, getNewAvatar } from '@/lib/avatars';
import { NEW_CHARACTER_DATA } from '@/lib/characters_new';

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
      isMystery: item.isMystery || false,
      isRevealed: false,
      hasGlow: item.isMystery || false,
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  const [spotlightChar, setSpotlightChar] = useState<{ name: string; tagline: string; quote: string; desc: string; png: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [roundTableMembers, setRoundTableMembers] = useState<RecommendItem[]>([]);
  const [roundTablePerspectives, setRoundTablePerspectives] = useState<{ characterName: string; viewpoint: string; story: string }[]>([]);
  const [roundTableLoading, setRoundTableLoading] = useState(false);
  const [roundTableLoadingText, setRoundTableLoadingText] = useState('');
  const [completedCBTSessions, setCompletedCBTSessions] = useState<Record<string, { question: string; modules: CBTResponse['modules'] }>>({});
  const [shareTarget, setShareTarget] = useState<{ characterName: string; question: string; modules: CBTResponse['modules'] } | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [, setDragState] = useState<{
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
    setLoadingDone(false); setLoadingProgress(0);

    // 从新角色池随机选一个 spotlight 角色
    const newKeys = Object.keys(NEW_CHARACTER_DATA);
    const randomKey = newKeys[Math.floor(Math.random() * newKeys.length)];
    setSpotlightChar({ name: randomKey, ...NEW_CHARACTER_DATA[randomKey] });

    // 最低展示时间 2s
    const minDisplayTimer = new Promise(resolve => setTimeout(resolve, 2000));

    // 进度模拟
    const progressTimer = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 85) return p;
        const step = p < 20 ? 2.5 : p < 50 ? 1.8 : 1;
        return Math.min(p + step, 85);
      });
    }, 250);

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/recommend`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
      .then(async (res) => { if (!res.ok) { const e = await res.json(); throw new Error(e.error || '推荐失败'); } return res.json(); })
      .then(async (data) => {
          const chars: RecommendItem[] = data.characters;
          const bubs = buildBubbles(chars);
          setRecommendCache(chars);
          setBubbles(bubs);
          clearInterval(progressTimer);
          setLoadingProgress(100);
          await minDisplayTimer;
          setLoadingDone(true);
        })
      .catch(async (e) => {
        clearInterval(progressTimer);
        await minDisplayTimer;
        setError(e instanceof Error ? e.message : '获取角色失败');
        setIsLoading(false);
      });
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

  function handleCBTComplete(data: CBTResponse) {
    setCompletedCBTSessions(prev => ({
      ...prev,
      [data.characterName]: { question: data.question, modules: data.modules },
    }));
  }

  function handleGoSee() {
    setIsLoading(false);
    setLoadingDone(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  const isRoundTableReady = roundTableMembers.length >= MAX_ROUNDTABLE_MEMBERS;

  const isEmpty = bubbles.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* 空态 — 顶部诗意文字 + 输入框在屏幕下3/4处 */}
      {isEmpty && !error && (
        <div className="flex-1 relative" style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH || ''}/avatars-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}>
          <div className="px-7 pt-8 text-center">
            <p className="text-[13px] text-warm-gray/40 tracking-wide mb-5">欢迎来到这里。</p>
            <p className="text-xs text-warm-gray/35 leading-relaxed tracking-wide mb-5">
              此刻，轻抚过你的风，落在你心头的雨<br />
              千百年前，也曾穿过他人的灵魂，打湿过他人的窗。
            </p>
            <p className="text-xs text-warm-gray/35 leading-relaxed tracking-wide mb-5">
              你所有藏在心里的念想和感受，
            </p>
            <p className="text-xs text-warm-gray/35 leading-relaxed tracking-wide mb-5">
              苏轼在黄州的江边吟过<br />
              三毛在撒哈拉的星空下望过<br />
              贝多芬在听不见的世界里听过<br />
              梵高在普罗旺斯的麦田里画过——
            </p>
            <p className="text-xs text-warm-gray/35 leading-relaxed tracking-wide mb-5">
              有人把它写成了诗，有人把它种成了树，<br />
              有人把它谱成了曲，有人把它画成了星空。
            </p>
            <p className="text-xs text-warm-gray/35 leading-relaxed tracking-wide mb-5">
              你的心情并不孤单，<br />
              它只是还没遇见懂它的人。
            </p>
            <p className="text-xs text-warm-gray/40 leading-relaxed tracking-wide mb-5">
              写下来吧，<br />
              让那些跨越时空的灵魂遇见你。
            </p>
            <p className="text-[13px] text-warm-gray/40 italic tracking-wider">
              &ldquo;总有一个灵魂，懂你的此刻&rdquo;
            </p>
          </div>

          {/* 空态输入框 — 定位在 ~75% 高度 */}
          <div className="flex-shrink-0 px-5 pb-8" style={{ marginTop: '18vh' }}>
            <div className="flex gap-2 items-end">
              <textarea value={question} onChange={(e) => {
                  setQuestion(e.target.value);
                  const el = e.target;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown} placeholder="今天想聊点什么" maxLength={200} rows={1}
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
          </div>
        </div>
      )}

      {/* 提示 / 输入框 — 非空态才有 */}
      {bubbles.length > 0 && !isLoading ? (
        <div className="px-5 pt-4 pb-1 flex-shrink-0">
          <p className="text-sm text-warm-gray/50 text-center">
            点击气泡跟TA聊聊，或者拖进圆桌群聊
          </p>
        </div>
      ) : !isEmpty && !isLoading ? (
        <div className="px-5 pt-3 pb-1 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea value={question} onChange={(e) => {
                setQuestion(e.target.value);
                const el = e.target;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown} placeholder="今天想聊点什么" maxLength={200} rows={1}
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
      ) : null}

      {/* 气泡区域 + 圆桌 */}
      {(isLoading || bubbles.length > 0) && (
      <div className="relative flex-1" style={{ minHeight: '400px' }}>
        {/* 气泡 */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center px-8" style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH || ''}/avatars-bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}>
            {/* 引用文字 + 进度条 — 页面中间 */}
            <div className="flex-1 flex flex-col items-center justify-center w-full" style={{ maxWidth: '320px' }}>
              <p className="text-sm text-warm-gray/45 italic leading-relaxed tracking-wide mb-6 whitespace-nowrap">
                &ldquo;你走在自己的夜里，而有人曾提灯走过同一段路。&rdquo;
              </p>

              <div className="flex flex-col items-center w-full" style={{ maxWidth: '260px', marginTop: '10vh' }}>
              <div className="w-full rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(0,0,0,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${loadingProgress}%`,
                    background: 'linear-gradient(90deg, #b8a088, #8b7355)',
                  }} />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <p className="text-xs text-warm-gray/40">{loadingDone ? '角色已就绪' : loadingText}</p>
                {loadingDone && (
                  <button
                    onClick={handleGoSee}
                    className="px-5 py-1.5 rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all hover:shadow-md"
                    style={{ background: 'rgba(180,160,140,0.15)', color: '#8b7355', border: '1px solid rgba(139,115,85,0.2)' }}
                  >
                    去看看
                  </button>
                )}
              </div>
            </div>

            </div>
            {/* 随机人物卡片 */}
            {spotlightChar && (
              <div className="rounded-2xl shadow-lg"
                style={{ width: '280px', maxWidth: 'calc(100vw - 64px)', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '20vh' }}>
                {/* 头像区 */}
                <div className="flex items-center gap-4 px-6 pt-16 pb-12">
                  {(() => {
                    const av = getNewAvatar(spotlightChar.name);
                    return isImageAvatar(av) ? (
                      <img src={av} alt={spotlightChar.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0, opacity: 0.65 }} />
                    ) : (
                      <span style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0, opacity: 0.65, background: 'linear-gradient(135deg, rgba(245,240,232,0.5), rgba(237,228,211,0.5))' }}>🫧</span>
                    );
                  })()}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate" style={{ color: 'rgba(62,50,40,0.55)' }}>{spotlightChar.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(62,50,40,0.4)' }}>{spotlightChar.tagline}</p>
                  </div>
                </div>
                {/* 描述 */}
                <div className="px-6 pt-4 pb-20">
                  <p className="text-sm" style={{ lineHeight: '1.8', color: 'rgba(62,50,40,0.45)' }}>{spotlightChar.desc}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && bubbles.length > 0 && (
          <div className="absolute inset-0">
            {bubbles.map((b, i) => {
              // 神秘气泡用独立组件渲染
              if (b.isMystery) {
                return (
                  <MysteryBubble
                    key={b.character.id}
                    bubble={b}
                    onClick={handleBubbleClick}
                    onPointerDown={handlePointerDown}
                  />
                );
              }

              const sz = b.size === 'large' ? 80 : b.size === 'medium' ? 60 : 44;
              const isInRoundTable = roundTableMembers.some(m => m.name === b.character.name);
              return (
                <div key={b.character.id}
                  className="bubble-float absolute flex flex-col items-center select-none"
                  style={{
                    left: b.position.x - sz / 2, top: b.position.y - sz / 2,
                    touchAction: 'none',
                    '--bubble-index': i,
                    '--ox': b.ox,
                    '--oy': b.oy,
                    '--mx': b.mx,
                    '--my': b.my,
                  } as React.CSSProperties}
                >
                  {/* 名字标签 */}
                  <span
                    className="text-[10px] font-medium text-warm-black/60 whitespace-nowrap mb-0.5"
                    style={{ opacity: isInRoundTable ? 0.4 : 0.75 }}
                  >
                    {b.character.name}
                  </span>

                  <div
                    className="rounded-full cursor-pointer overflow-hidden flex items-center justify-center"
                    style={{
                      width: sz, height: sz,
                      background: `radial-gradient(circle at 35% 30%, ${b.color}, ${b.color}dd)`,
                      fontSize: b.size === 'large' ? 32 : b.size === 'medium' ? 24 : 18,
                      border: '2px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)',
                      opacity: isInRoundTable ? 0.4 : 1,
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

                  {/* 分享按钮 — CBT 完成后显示 */}
                  {completedCBTSessions[b.character.name] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const session = completedCBTSessions[b.character.name];
                        setShareTarget({ characterName: b.character.name, ...session });
                      }}
                      className="mt-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] text-white font-medium shadow-md active:scale-90 transition-transform"
                      style={{ background: 'linear-gradient(135deg, var(--color-philosopher), var(--color-rebel))' }}
                    >
                      <span style={{ fontSize: '10px' }}>📤</span>
                      分享
                    </button>
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
        {bubbles.length > 0 && !isLoading && (
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
      )}

      <BottomBar />

      <StoryModal character={storyCharacter} onClose={() => setStoryCharacter(null)} onChat={handleChat} />

      <AnimatePresence>
        {selectedCharacterName && (
          <CBTDialog characterName={selectedCharacterName} question={question}
            characterDomain={cbtDomain} onClose={() => setSelectedCharacterName(null)}
            onError={(msg) => setError(msg)}
            onComplete={handleCBTComplete} />
        )}
      </AnimatePresence>

      <RoundTableResult
        perspectives={roundTablePerspectives} members={roundTableMembers}
        isLoading={roundTableLoading} loadingText={roundTableLoadingText}
        question={question}
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

      <AnimatePresence>
        {shareTarget && (
          <ShareImageModal
            question={shareTarget.question}
            characterName={shareTarget.characterName}
            modules={shareTarget.modules}
            onClose={() => setShareTarget(null)}
            autoDownload
          />
        )}
      </AnimatePresence>

    </div>
  );
}