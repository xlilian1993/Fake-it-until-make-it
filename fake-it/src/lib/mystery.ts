import type { CharacterDomain, CharacterSource, RecommendItem } from '@/types';
import { getAvatar } from './avatars';

export interface MysteryEntry {
  name: string;
  domain: CharacterDomain;
  source: CharacterSource;
}

const MYSTERY_POOL: MysteryEntry[] = [
  { name: '甄嬛', domain: 'leader', source: 'tv' },
  { name: '林黛玉', domain: 'creator', source: 'book' },
  { name: '乔布斯', domain: 'leader', source: 'real' },
  { name: '宫崎骏', domain: 'creator', source: 'real' },
  { name: '庄子', domain: 'philosopher', source: 'real' },
  { name: '马斯克', domain: 'explorer', source: 'real' },
  { name: '贝多芬', domain: 'creator', source: 'real' },
  { name: '居里夫人', domain: 'explorer', source: 'real' },
];

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function getDailyMystery(): MysteryEntry {
  const seed = dateSeed();
  const idx = seed % MYSTERY_POOL.length;
  return MYSTERY_POOL[idx];
}

export function getMysteryAvatar(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${base}/mystery-face.png`;
}

export function getMysteryCharacterAvatar(name: string): string {
  return getAvatar(name);
}

const SOURCE_LABELS: Record<string, string> = {
  real: '现实人物',
  movie: '电影角色',
  tv: '电视剧角色',
  game: '游戏角色',
  book: '书籍角色',
  anime: '动漫角色',
};

export function toRecommendItem(entry: MysteryEntry): RecommendItem {
  return {
    name: entry.name,
    matchScore: 88,
    domain: entry.domain,
    source: entry.source,
    story: {
      intro: {
        name: entry.name,
        source: SOURCE_LABELS[entry.source] || entry.source,
        tagline: '今日神秘推荐',
      },
      facets: [
        { label: '神秘推荐', content: `今日特别为你揭晓这位跨越时空的角色 —— ${entry.name}。每一天都有新的遇见。` },
      ],
    },
  };
}
