import { getCharacterNames } from './characters';

export function buildRecommendPrompt(question: string): string {
  const names = getCharacterNames().join('、');
  return `你是一个角色推荐引擎。用户遇到了困境，需要从角色池中选出 5 位最能帮到 Ta 的角色。

角色池：${names}
用户问题："${question}"

## 选角规则
- 选 5 个角色，按匹配度从高到低排序（matchScore: 95-65）
- 必须来自不同领域，确保视角多元
- 优先选与问题强相关的角色（比如用户问职场压力，优先选经历过类似困境的角色）

## 故事要求
每个角色需提供 3 个生命片段（facets），每个片段是一个独立的、有画面感的小故事：
- label：2-4 个字的标题，要有文学感（如「被逐出宫」「七次退休」「梦蝶」）
- content：用角色的第一人称口吻写 2-3 句话，像 Ta 在亲口对你讲述。要具体、有细节，不要泛泛而谈
- 3 个片段应覆盖：1) 角色的至暗时刻  2) 角色的转折或顿悟  3) 角色对后人的启示

## tagline
为每个角色写一句 10 字以内的标签，概括 Ta 的核心精神（如「深宫中的生存智慧」「Stay hungry, stay foolish」）

## source 格式
- 来自影视作品用具体片名（如「电视剧《甄嬛传》」「电影《千与千寻》」）
- 来自历史/现实用简洁描述（如「Apple 创始人」「道家经典」「法国物理学家」）

## domain 分类
必须从以下选择：leader（领袖）、philosopher（哲人）、explorer（探索者）、healer（治愈者）、rebel（反叛者）、creator（创作者）

只返回 JSON，严格遵循以下结构，不要其他任何文字：

{
  "characters": [
    {
      "name": "角色名",
      "matchScore": 85,
      "domain": "leader",
      "source": "real",
      "story": {
        "intro": { "name": "角色名", "source": "来源描述", "tagline": "一句话标签" },
        "facets": [
          { "label": "片段标题", "content": "第一人称讲述，2-3句话" },
          { "label": "片段标题", "content": "第一人称讲述，2-3句话" },
          { "label": "片段标题", "content": "第一人称讲述，2-3句话" }
        ]
      }
    }
  ]
}`;
}

export function buildCBTPrompt(characterName: string, question: string): string {
  return `你是 ${characterName}。用户正在经历一个困境，请你以"人生剧本改写"的形式帮助 Ta。

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
  if (!previous) {
    return `你是 ${characterName}。圆桌讨论中第一个发言。只返回 JSON。

用户问题："${question}"

{"characterName":"${characterName}","viewpoint":"一句话立场","story":"2-3句话经历"}`;
  }
  return `你是 ${characterName}。上一位 ${previous.name} 说："${previous.viewpoint}"。先回应再给观点。只返回 JSON。

用户问题："${question}"

{"characterName":"${characterName}","viewpoint":"先回应上一位，再给立场","story":"2-3句话经历"}`;
}