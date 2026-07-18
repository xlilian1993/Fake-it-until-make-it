'use client';

import { useCallback } from 'react';
import type { Bubble, BubbleSize } from '@/types';
import { matchScoreToSize, SIZE_PX, DOMAIN_COLORS } from '@/lib/colors';
import { getAvatar } from '@/lib/avatars';
import type { RecommendItem } from '@/types';

// 容器尺寸（手机长宽比 375x812，留出输入框和底部栏）
const CANVAS_WIDTH = 375;
const CANVAS_HEIGHT = 600; // 气泡区域可用高度

function randomPosition(size: number): { x: number; y: number } {
  const padding = size / 2 + 8;
  const x = padding + Math.random() * (CANVAS_WIDTH - 2 * padding);
  const y = padding + Math.random() * (CANVAS_HEIGHT - 2 * padding);
  return { x, y };
}

function randomDuration(size: BubbleSize): number {
  // 大气泡慢，小气泡快
  const base = size === 'large' ? 18 : size === 'medium' ? 14 : 10;
  return base + Math.random() * 4; // ±2s 抖动
}

function randomDelay(): number {
  return -Math.random() * 10; // 负延迟让气泡初始位置分散
}

// 从推荐结果生成气泡数组
export function useBubbles() {
  const buildBubbles = useCallback((items: RecommendItem[]): Bubble[] => {
    return items.map((item): Bubble => {
      const size = matchScoreToSize(item.matchScore);
      const sizePx = SIZE_PX[size];
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
        animationDuration: randomDuration(size),
        animationDelay: randomDelay(),
        ox: `${(Math.random() * 50 - 25).toFixed(1)}px`,
        oy: `${(Math.random() * -60 - 10).toFixed(1)}px`,
        mx: `${(Math.random() * 30 - 15).toFixed(1)}px`,
        my: `${(Math.random() * -50).toFixed(1)}px`,
        isMystery: false,
        isRevealed: false,
        hasGlow: false,
      };
    });
  }, []);

  return { buildBubbles, CANVAS_WIDTH, CANVAS_HEIGHT };
}
