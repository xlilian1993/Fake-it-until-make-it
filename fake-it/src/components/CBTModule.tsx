'use client';

import { useState, useEffect, useRef } from 'react';
import type { CBTModule } from '@/types';

interface CBTModuleViewProps {
  module: CBTModule;
  onComplete: () => void;
}

// 单个 CBT 模块：逐字渲染
export function CBTModuleView({ module, onComplete }: CBTModuleViewProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const content = module.content;
    let index = 0;
    setDisplayText('');
    setIsComplete(false);

    // 逐字渲染，每 30ms 一个字
    timerRef.current = setInterval(() => {
      if (index < content.length) {
        setDisplayText(content.slice(0, index + 1));
        index += 1;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsComplete(true);
        // 完成后等 1 秒再通知父组件
        setTimeout(() => onComplete(), 800);
      }
    }, 30);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  return (
    <div className="module-enter">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-philosopher/20 text-xs font-medium text-warm-black">
          {module.index}
        </span>
        <h4 className="font-heading text-sm font-medium text-warm-black">
          {module.title}
        </h4>
      </div>
      <p className="text-sm text-warm-black leading-relaxed whitespace-pre-wrap pl-8">
        {displayText}
        {!isComplete && (
          <span className="inline-block w-0.5 h-4 bg-warm-gray ml-0.5 pulse-soft align-middle" />
        )}
      </p>

      {/* 模块5特有：行动方案 */}
      {module.index === 5 && isComplete && 'action' in module && module.action && (
        <div className="mt-3 space-y-2 pl-8 fade-in-up">
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
  );
}
