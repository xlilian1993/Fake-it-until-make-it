'use client';

// 底部操作栏（静态图标占位，功能后续实现）
export function BottomBar() {
  return (
    <div
      className="flex items-center justify-around px-6 py-3 border-t"
      style={{
        borderColor: 'var(--color-warm-border)',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* 收藏占位 */}
      <button
        className="flex flex-col items-center gap-1 opacity-40 cursor-default"
        aria-label="收藏（即将推出）"
        disabled
      >
        <span className="text-xl">⭐</span>
        <span className="text-xs text-warm-gray">收藏</span>
      </button>

      {/* 历史占位 */}
      <button
        className="flex flex-col items-center gap-1 opacity-40 cursor-default"
        aria-label="历史（即将推出）"
        disabled
      >
        <span className="text-xl">📖</span>
        <span className="text-xs text-warm-gray">历史</span>
      </button>
    </div>
  );
}
