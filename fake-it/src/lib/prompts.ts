export function buildCBTPrompt(characterName: string, question: string): string {
  return `你是 ${characterName}。用户正在经历一个困境，请你以"人生剧本改写"的形式帮助 Ta——就像你是一位编剧，帮 Ta 重新审视并重写当前的人生剧本。

用户问题："${question}"

请严格按照以下 JSON 格式返回 5 幕（不要其他文字）：

{
  "characterName": "${characterName}",
  "question": "${question}",
  "modules": [
    {
      "index": 1,
      "title": "第一幕：你的处境",
      "content": "以 ${characterName} 的口吻，像编剧描述开场一样，帮用户看清现在正在发生什么困境，2-3句话"
    },
    {
      "index": 2,
      "title": "第二幕：隐藏的台词",
      "content": "指出用户内心可能反复出现的那个自动负面念头——那个藏在幕后的独白，2-3句话"
    },
    {
      "index": 3,
      "title": "第三幕：换个剧本",
      "content": "以 ${characterName} 的亲身经历或智慧为例，告诉用户同一个场景可以有不同的写法，2-3句话"
    },
    {
      "index": 4,
      "title": "第四幕：新的对白",
      "content": "给用户一句可以替换旧台词的新的内心对白——角色亲自写给用户的台词，2-3句话"
    },
    {
      "index": 5,
      "title": "第五幕：你的舞台",
      "content": "给用户一个具体可执行的行动建议，让 Ta 从今天就开始排练新剧本",
      "action": {
        "firstStep": "今天可以做的第一件小事",
        "emergencyScript": "当旧台词再次响起时，可以替换的新对白",
        "backupPlan": "如果第一步不顺手，可以换一个方式试试"
      }
    }
  ]
}`;
}
