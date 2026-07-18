'use client';

import { useRef, useEffect } from 'react';
import { downloadCardAsPng } from '@/lib/downloadImage';

interface Perspective {
  characterName: string;
  viewpoint: string;
  story: string;
}

interface RoundTableShareProps {
  question: string;
  perspectives: Perspective[];
  onClose: () => void;
}

export function RoundTableShare({ question, perspectives, onClose }: RoundTableShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const didDownload = useRef(false);

  useEffect(() => {
    if (didDownload.current) return;
    didDownload.current = true;
    const timer = setTimeout(async () => {
      if (!cardRef.current) return;
      await downloadCardAsPng(cardRef.current, 'fake-it-roundtable.png');
      onClose();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '340px',
    background: '#FDF6EE',
    borderRadius: '16px',
    padding: '28px 20px',
    fontFamily: '"Noto Serif SC", "Noto Sans SC", serif',
    color: '#3D3226',
    lineHeight: 1.6,
    zIndex: 99999,
    opacity: 0.999,
  };

  return (
    <div ref={cardRef} style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.4)', margin: '0 0 2px 0' }}>Fake It Until You Make It</p>
        <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>圆桌讨论</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.35)', margin: '0 0 4px 4px' }}>讨论话题</p>
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '10px 14px' }}>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{question}</p>
        </div>
      </div>

      <div>
        {perspectives.map((p, idx) => (
          <div key={idx} style={{ marginBottom: idx === perspectives.length - 1 ? '0' : '16px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(61,50,38,0.35)', margin: '0 0 6px 4px' }}>
              {p.characterName}的观点
            </p>
            <div style={{ background: '#fff', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', marginBottom: '8px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.4)', margin: '0 0 4px 0' }}>💡 观点</p>
              <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{p.viewpoint}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '14px 14px 14px 4px', padding: '10px 14px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(61,50,38,0.4)', margin: '0 0 4px 0' }}>📖 经历</p>
              <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{p.story}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: '11px', color: 'rgba(61,50,38,0.35)', margin: 0 }}>
          — Fake it until you make it —
        </p>
      </div>
    </div>
  );
}
