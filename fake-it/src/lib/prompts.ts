import { getCharacterNames, getCharacterHotness, getCharacterSelfRef } from './characters';

function buildCharacterList(excludeName: string): string {
  const names = getCharacterNames().filter(n => n !== excludeName);
  return names
    .map(n => `${n}(热度${getCharacterHotness(n)})`)
    .join('、');
}

export function buildRecommendPrompt(question: string, mysteryName: string): string {
  const charList = buildCharacterList(mysteryName);
  const mysterySelfRef = getCharacterSelfRef(mysteryName);
  return `你是一个角色推荐引擎。用户遇到了困境，需要推荐最适合的角色。所有内容必须使用中文。

## 今日限定角色（已固定，不可更改）
**${mysteryName}**（自称：${mysterySelfRef}）

## 角色池（含热度分值）
${charList}

用户问题："${question}"

## 任务
1. 为今日限定角色 **${mysteryName}** 生成动态介绍（3个生命片段，贴合用户问题）
2. 从角色池中再选 5 个角色推荐给用户

## 今日限定角色的故事要求
生成 3 个生命片段，必须贴合用户问题来写：
- label：2-4 个字标题，有文学感
- content：用角色第一人称口吻写 2-3 句话，内容必须与用户问题产生共鸣，具体有细节
- 角色自称必须符合其身世背景，但必须使用中文（如乔布斯称"我"而非"I"、唐僧称"贫僧"、孙悟空称"俺老孙"）
- 3 个片段覆盖：1) 角色类似的困境时刻  2) 角色的转折或领悟  3) 给用户的具体启示

## 普通推荐的选角规则
- 严格从角色池中选 5 个角色，按匹配度排序（matchScore: 95-65）
- **禁止选择角色池以外的任何角色，只能从上述列表中选择**
- 必须来自不同领域，视角多元
- 综合评分 = 问题关联度(60%) + 角色热度(40%)
- 优先选与问题强相关的角色

## 普通推荐的故事要求
每个角色 3 个生命片段：
- 同上格式
- 覆盖：1) 至暗时刻  2) 转折或顿悟  3) 对后人的启示

## tagline
每个角色一句 10 字以内标签

## source 格式
- 影视作品用具体片名
- 历史/现实用简洁描述

## domain 分类
leader、philosopher、explorer、healer、rebel、creator

只返回 JSON：
{
  "characters": [
    {
      "name": "${mysteryName}",
      "matchScore": 92,
      "domain": "leader",
      "source": "real",
      "isMystery": true,
      "story": {
        "intro": { "name": "${mysteryName}", "source": "来源", "tagline": "标签" },
        "facets": [
          { "label": "片段标题", "content": "第一人称讲述" },
          { "label": "片段标题", "content": "第一人称讲述" },
          { "label": "片段标题", "content": "第一人称讲述" }
        ]
      }
    },
    {
      "name": "角色名",
      "matchScore": 85,
      "domain": "philosopher",
      "source": "book",
      "isMystery": false,
      "story": { ... }
    }
  ]
}

共 6 个角色（1 个今日限定 + 5 个普通推荐）`;
}


export function buildCBTPrompt(characterName: string, question: string): string {
  const selfRef = getCharacterSelfRef(characterName);
  return `你是 ${characterName}。请用"${selfRef}"自称（必须使用中文），保持角色的经典口吻。用户正在经历一个困境，请你以"人生剧本改写"的形式帮助 Ta。

用户问题："${question}"

请严格按照以下 JSON 格式返回 5 幕（不要其他文字）：

{
  "characterName": "${characterName}",
  "question": "${question}",
  "modules": [
    {
      "index": 1,
      "title": "第一幕：你的处境",
      "content": "以 ${characterName} 的口吻，帮用户看清现在正在发生什么困境，2-3句话"
    },
    {
      "index": 2,
      "title": "第二幕：隐藏的台词",
      "content": "指出用户内心可能反复出现的那个自动负面念头，2-3句话"
    },
    {
      "index": 3,
      "title": "第三幕：换个剧本",
      "content": "以 ${characterName} 的亲身经历为例，告诉用户同一个场景可以有不同的写法，2-3句话"
    },
    {
      "index": 4,
      "title": "第四幕：新的对白",
      "content": "给用户一句可以替换旧台词的新的内心对白，2-3句话"
    },
    {
      "index": 5,
      "title": "第五幕：你的舞台",
      "content": "给用户一个具体可执行的行动建议",
      "action": {
        "firstStep": "今天可以做的第一件小事",
        "emergencyScript": "当旧台词再次响起时，可以替换的新对白",
        "backupPlan": "如果第一步不顺手，可以换一个方式试试"
      }
    }
  ]
}`;
}

export function buildRoundTablePrompt(characterName: string, question: string, previous?: { name: string; viewpoint: string; story: string }): string {
  const selfRef = getCharacterSelfRef(characterName);
  if (!previous) {
    return `你是 ${characterName}。请用"${selfRef}"自称（必须使用中文），保持角色口吻。圆桌讨论中第一个发言。只返回 JSON。

用户问题："${question}"

{"characterName":"${characterName}","viewpoint":"一句话立场","story":"2-3句话经历"}`;
  }
  const prevSelfRef = getCharacterSelfRef(previous.name);
  return `你是 ${characterName}。请用"${selfRef}"自称（必须使用中文），保持角色口吻。上一位 ${previous.name} 说："${previous.viewpoint}"。注意上一位用"${prevSelfRef}"自称，你作为${characterName}应该用"${selfRef}"自称。先回应再给观点。只返回 JSON。

用户问题："${question}"

{"characterName":"${characterName}","viewpoint":"先回应上一位，再给立场","story":"2-3句话经历"}`;
}
