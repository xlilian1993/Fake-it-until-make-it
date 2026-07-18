import { NextRequest, NextResponse } from 'next/server';
import type { RecommendResult } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 5;

// MOCK: 固定返回 5 个角色，用于调试图片
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
          { label: '甘露寺的蛰伏', content: '被逐出宫后，我在甘露寺受尽苦楚，却也在那里看清了自己的心。真正的强大不是争宠，而是知道自己要什么。' },
          { label: '回宫的决断', content: '为了保护家人和自己，我选择回宫，不再天真。每一步都走得小心翼翼，但也步步为营。' },
          { label: '最后的释然', content: '权力到手，也不过是枷锁。真正的自由是放下。' },
        ],
      },
    },
    {
      name: '林黛玉',
      matchScore: 88,
      domain: 'healer',
      source: 'book',
      story: {
        intro: { name: '林黛玉', source: '《红楼梦》', tagline: '质本洁来还洁去' },
        facets: [
          { label: '葬花', content: '花谢花飞花满天，红消香断有谁怜。我葬的不是花，是自己的心事。' },
          { label: '诗社才情', content: '海棠诗社里，我的诗总是最出挑的。才华是孤独的补偿。' },
          { label: '焚稿断痴', content: '知道真相的那一刻，我烧掉了所有诗稿。有些感情，注定要还给天地。' },
        ],
      },
    },
    {
      name: 'Steve Jobs',
      matchScore: 85,
      domain: 'leader',
      source: 'real',
      story: {
        intro: { name: 'Steve Jobs', source: 'Apple 创始人', tagline: 'Stay hungry, stay foolish' },
        facets: [
          { label: '被自己公司开除', content: '被 Apple 董事会解雇后，我没有放弃。我创办了 NeXT 和 Pixar，后来带着这些经验重返 Apple。' },
          { label: 'Stay hungry', content: '在斯坦福演讲时我说过，死亡是生命最好的发明。每天都当作最后一天来过。' },
          { label: '现实扭曲力场', content: '人们说我创造了一个现实扭曲力场。其实我只是相信：那些疯狂到以为自己能改变世界的人，才能真正改变世界。' },
        ],
      },
    },
    {
      name: '宫崎骏',
      matchScore: 82,
      domain: 'creator',
      source: 'real',
      story: {
        intro: { name: '宫崎骏', source: '吉卜力工作室', tagline: '用画笔守护温柔' },
        facets: [
          { label: '坚持手绘', content: '在 3D 时代，我坚持每一帧手绘，因为那是动画的灵魂。机器永远画不出人的温度。' },
          { label: '七次退休', content: '我说了七次退休，又七次回来。真正热爱的事情，是放不下的。' },
          { label: '龙猫的诞生', content: '龙猫的故事来自我童年的想象。有时候，最柔软的东西，最有力量。' },
        ],
      },
    },
    {
      name: '庄子',
      matchScore: 78,
      domain: 'philosopher',
      source: 'real',
      story: {
        intro: { name: '庄子', source: '道家经典', tagline: '逍遥游的智者' },
        facets: [
          { label: '梦蝶', content: '不知周之梦为胡蝶，还是胡蝶之梦为周。人生如梦，何必执着于一时得失。' },
          { label: '濠梁之辩', content: '子非鱼，安知鱼之乐？每个人的快乐只有自己知道，何必在意别人的眼光。' },
          { label: '无用的树', content: '一棵歪歪扭扭的树，因为不成材而活了几百年。有时候"无用"反而是最大的自由。' },
        ],
      },
    },
  ],
};

export async function POST(request: NextRequest) {
  return NextResponse.json(MOCK_RESULT);
}