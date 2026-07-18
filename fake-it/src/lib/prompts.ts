import { getCharacterNames } from './characters';

export function buildRecommendPrompt(question: string): string {
  const names = getCharacterNames().join('、');
  return `从角色池中选 5 位与问题最相关的角色。

角色池：${names}
用户问题："${question}"

你必须只返回一个 JSON 对象，第一行必须是 {"characters":[，不要任何其他文字。

格式：
{"characters":[{"name":"角色名","matchScore":85,"domain":"leader","source":"real","story":{"intro":{"name":"角色名","source":"来源","tagline":"标签"},"facets":[{"label":"标题","content":"2-3句话"},{"label":"标题","content":"2-3句话"},{"label":"标题","content":"2-3句话"}]}},{"name":"角色名2","matchScore":80,"domain":"philosopher","source":"real","story":{"intro":{"name":"角色名2","source":"来源","tagline":"标签"},"facets":[{},{},{}]}},{"name":"角色名3","matchScore":75,"domain":"explorer","source":"real","story":{"intro":{"name":"角色名3","source":"来源","tagline":"标签"},"facets":[{},{},{}]}},{"name":"角色名4","matchScore":70,"domain":"healer","source":"tv","story":{"intro":{"name":"角色名4","source":"来源","tagline":"标签"},"facets":[{},{},{}]}},{"name":"角色名5","matchScore":65,"domain":"creator","source":"real","story":{"intro":{"name":"角色名5","source":"来源","tagline":"标签"},"facets":[{},{},{}]}}]}

要求：5 个角色来自不同领域，只返回 JSON，第一行必须是 {"characters":[。`;
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