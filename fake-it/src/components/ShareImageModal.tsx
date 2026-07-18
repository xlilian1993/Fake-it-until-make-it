'use client';

import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CBTModule } from '@/types';
import { downloadCardAsPng } from '@/lib/downloadImage';

interface ShareImageModalProps {
  question: string;
  characterName: string;
  modules: CBTModule[];
  onClose: () => void;
  autoDownload?: boolean;
}

function CardContent({ question, characterName, modules }: { question: string; characterName: string; modules: CBTModule[] }) {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.4)', margin: '0 0 2px 0' }}>Fake It Until You Make It</p>
        <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
          与 {characterName} 的对话
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.35)', margin: '0 0 4px 4px' }}>你的问题</p>
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '10px 14px' }}>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{question}</p>
        </div>
      </div>

      <div>
        <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.35)', margin: '0 0 8px 4px' }}>{characterName} 的回应</p>
        {modules.map((mod, i) => {
          const isLast = i === modules.length - 1;
          const hasAction = mod.index === 5 && 'action' in mod && (mod as any).action;
          return (
            <div key={i} style={{ marginBottom: isLast ? '0' : '12px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(61,50,38,0.35)', margin: '0 0 4px 4px' }}>{mod.title}</p>
              <div style={{ background: '#fff', borderRadius: '14px 14px 14px 4px', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{mod.content}</p>
              </div>
              {hasAction && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { emoji: '🎬', label: '今天的排练', text: (mod as any).action.firstStep },
                    { emoji: '🎭', label: '新台词', text: (mod as any).action.emergencyScript },
                    { emoji: '🪄', label: '进阶剧本', text: (mod as any).action.backupPlan },
                  ].map((item, j) => (
                    <div key={j} style={{ background: '#fff', border: '1px solid rgba(184,169,255,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.4)', margin: '0 0 4px 0' }}>{item.emoji} {item.label}</p>
                      <p style={{ fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '11px', color: 'rgba(61,50,38,0.35)', margin: 0 }}>
          — Fake it until you make it —
        </p>
      </div>
    </>
  );
}

export function ShareImageModal({ question, characterName, modules, onClose, autoDownload }: ShareImageModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const didDownload = useRef(false);
  const doDownload = useCallback(async () => {
    if (!cardRef.current) return;
    await downloadCardAsPng(cardRef.current, `fake-it-${characterName}.png`);
  }, [characterName]);

  // 自动下载：等待卡片渲染后自动点击保存按钮
  useEffect(() => {
    if (autoDownload && !didDownload.current) {
      didDownload.current = true;
      const timer = setTimeout(async () => {
        await doDownload();
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, doDownload, onClose]);

  const cardStyle: React.CSSProperties = {
    width: '340px',
    background: '#FDF6EE',
    borderRadius: '16px',
    padding: '28px 20px',
    fontFamily: '"Noto Serif SC", "Noto Sans SC", serif',
    color: '#3D3226',
    lineHeight: 1.6,
  };

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white" aria-label="关闭">
          <span className="text-sm">←</span>
        </button>
        <span className="text-sm text-white font-medium">分享长图</span>
        <div className="flex-1" />
        <button onClick={doDownload} className="px-4 py-1.5 rounded-full bg-white text-warm-black text-xs font-semibold">
          保存图片
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex justify-center">
        <div ref={cardRef} style={cardStyle}>
          <CardContent question={question} characterName={characterName} modules={modules} />
        </div>
      </div>
    </motion.div>
  );
}
