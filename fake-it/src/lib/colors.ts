import type { BubbleSize, CharacterDomain } from '@/types';

export const DOMAIN_COLORS: Record<CharacterDomain, string> = {
  leader: '#FFD700',
  philosopher: '#B8A9FF',
  explorer: '#7FE5FF',
  healer: '#A8FFD7',
  rebel: '#FF9EC7',
  creator: '#FFD49E',
};

export const SIZE_PX: Record<BubbleSize, number> = {
  large: 80,
  medium: 60,
  small: 44,
};

export const SIZE_TOUCH: Record<BubbleSize, number> = {
  large: 96,
  medium: 72,
  small: 56,
};

export function matchScoreToSize(score: number): BubbleSize {
  if (score >= 80) return 'large';
  if (score >= 60) return 'medium';
  return 'small';
}
