import { NextRequest, NextResponse } from 'next/server';
import type { RecommendResult } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 5;

// MOCK: 固定返回甄嬛 + 4 个角色，用于调试图片
const MOCK_RESULT: RecommendResult = {
  characters: [
    {
      name: '甄嬛',
      matchScore: 95,
      domain: 'healer',
      source: 'tv',
      story: {
        intro: { name: '甄嬛', source: '电视剧《甄嬛传》', tagline: '深宫中的生存智慧' },
        facets: [
          { label: '甘露寺的蛰伏', content: '被逐出宫后，我在甘露寺受尽苦楚，却也在那里看清了自己的心。' },
          { label: '回宫的决断', content: '为了保护家人和自己，我选择回宫，不再天真。' },
          { label: '最后的释然', content: '权力到手，也不过是枷锁。真正的自由是放下。' },
        ],
      },
    },
    {
      name: '庄子',
      matchScore: 88,
      domain: 'philosopher',
      source: 'real',
      story: {
        intro: { name: '庄子', source: '道家经典', tagline: '逍遥游的智者' },
        facets: [
          { label: '梦蝶', content: '不知周之梦为胡蝶，还是胡蝶之梦为周。' },
          { label: '濠梁之辩', content: '子非鱼，安知鱼之乐？' },
        ],
      },
    },
    {
      name: '哪吒',
      matchScore: 85,
      domain: 'rebel',
      source: 'anime',
      story: {
        intro: { name: '哪吒', source: '动画电影', tagline: '我命由我不由天' },
        facets: [
          { label: '莲花化身', content: '削骨还父，削肉还母，以莲花重塑真身。' },
          { label: '反抗天命', content: '别人的看法都是狗屁，你是谁只有你自己说了算。' },
        ],
      },
    },
    {
      name: 'Steve Jobs',
      matchScore: 82,
      domain: 'leader',
      source: 'real',
      story: {
        intro: { name: 'Steve Jobs', source: 'Apple 创始人', tagline: 'Stay hungry, stay foolish' },
        facets: [
          { label: '被自己公司开除', content: '被 Apple 董事会解雇后，我创办了 NeXT 和 Pixar。' },
          { label: '王者归来', content: '重返 Apple，用 iMac 和 iPhone 重新定义科技。' },
        ],
      },
    },
    {
      name: '宫崎骏',
      matchScore: 78,
      domain: 'creator',
      source: 'real',
      story: {
        intro: { name: '宫崎骏', source: '吉卜力工作室', tagline: '用画笔守护温柔' },
        facets: [
          { label: '坚持手绘', content: '在 3D 时代，我坚持每一帧手绘，因为那是动画的灵魂。' },
          { label: '温柔的反抗', content: '我的电影总是在说：即使世界残酷，也要温柔地活下去。' },
        ],
      },
    },
  ],
};

export async function POST(request: NextRequest) {
  // MOCK: 直接返回固定数据
  return NextResponse.json(MOCK_RESULT);
}
