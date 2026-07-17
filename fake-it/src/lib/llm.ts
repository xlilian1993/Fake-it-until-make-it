const ROUNDTABLE_MOCK: Record<string, { characterName: string; viewpoint: string; story: string }> = {
  '甄嬛': { characterName: '甄嬛', viewpoint: '真正的强大不是争宠，而是知道自己要什么。', story: '被逐出宫后在甘露寺的日子，反而让我看清了真相——有时候失去反而是重新开始的机会。' },
  '林黛玉': { characterName: '林黛玉', viewpoint: '敏感不是弱点，能感受细微才懂得珍惜。但别让感受困住自己。', story: '葬花那天我明白了一件事：与其为花谢而悲，不如记得它曾盛开。' },
  'Steve Jobs': { characterName: 'Steve Jobs', viewpoint: 'The dots connect backwards. 相信你的直觉，哪怕现在看不清前方的路。', story: '被自己创办的公司开除，是我人生最好的事情——它让我重新以初学者的心态出发。' },
  '宫崎骏': { characterName: '宫崎骏', viewpoint: '与其焦虑未来，不如专注于今天能画好的一帧。', story: '我说了七次退休，又七次回来。因为真正热爱的事是放不下的。' },
  '庄子': { characterName: '庄子', viewpoint: '天地与我并生，万物与我为一。何必执着于一时得失？', story: '梦蝶之后我一直在想：也许人生所有的焦虑，都来自我们太把自己当回事。' },
};

const CBT_SCRIPTS: Record<string, { content: string; act2: string; act3: string; act4: string; act5: string; firstStep: string; newLine: string; backupPlan: string }> = {
  '甄嬛': { content: '你现在的处境，就像我刚入宫时——每一步都小心翼翼，生怕出错。你以为必须做到完美，才能在别人的期待里活下来。', act2: '我猜你心里一直在对自己说：如果我不够好，就会让所有人失望。但甄嬛告诉你——别人的期待是他们的，不是你的。', act3: '在甘露寺被所有人遗忘的那段日子，我反而第一次听见了自己的声音。失去，有时候是老天给你留的空白。', act4: '下次那个"我不够好"的声音出现时，试试这样对自己说："我不是不够好，我只是还没习惯做自己。"', act5: '不必一步登天，从最小的动作开始。', firstStep: '今天找一个安静的时刻，写下你内心最常对自己说的那句"台词"', newLine: '我不是不够好，我只是还没习惯做自己', backupPlan: '找个信任的朋友，把这句话读给 Ta 听，让新的台词被另一个人的耳朵听见' },
  '林黛玉': { content: '你看这满园花开花落，心里头是不是也有一场风暴不合时宜地刮着。别人说你"太敏感"，可我知道，那是你在用力地感受这个世界。', act2: '你心里是不是在念："无论我怎么做，最终都会被辜负"——这句台词，贾府里我也念过无数遍。', act3: '葬花的时候，我以为美好都会凋零。但后来才明白，花落了会结果，凋谢不是结束，是另一段生命的开始。', act4: '当旧台词再响起时，试着换一句："我选择信任，不是因为不会受伤，而是因为我的勇气比恐惧大。"', act5: '你不需要一下子就改变，从一点小小的舒展开始。', firstStep: '今天走出门，找一个你喜欢的东西——一朵花、一片云、一杯茶——然后只感受它，不评判自己', newLine: '我选择信任，不是因为不会受伤，而是因为我的勇气比恐惧大', backupPlan: '把你的感受写成三行诗，不需要给任何人看，只是让它离开你的身体，落在纸上' },
  'Steve Jobs': { content: `You are exactly where I was in 1985 — standing in the wreckage of something you built, wondering if any of it mattered. This is your opening scene, and it is not a tragedy.`, act2: `The line running in your head is probably "I failed" or "I'm not good enough." I had that same script looping after Apple fired me. But the script is lying.`, act3: `Getting fired from Apple was the best thing that ever happened to me. It freed me to enter one of the most creative periods of my life — NeXT, Pixar, falling in love. The heaviness you feel right now? It might be the weight of a door opening.`, act4: `Replace the old line with this one: "You can't connect the dots looking forward; you can only connect them looking backward." Trust the dots.`, act5: `Do one small act of creation today. That is how you start rewriting.`, firstStep: `Take 10 minutes to make something — anything — that leaves your fingerprint on the world today`, newLine: `You can't connect the dots looking forward — so trust them now`, backupPlan: `Go for a walk without your phone. Let your mind wander. The best ideas come when you disconnect.` },
  '宫崎骏': { content: '你现在的心情，就像动画里的主角发现自己站在一片陌生的森林里——不知道方向，但故事才刚刚开始。', act2: '你是不是一直在心里说："我可能做不到""我害怕失败"。但你知道吗，每一部吉卜力作品在画第一笔的时候，我也不知道答案。', act3: '我说过七次退休，又七次回来。每次回来画第一帧的时候手都是抖的。不是因为自信，而是因为——颤抖的手依然可以画出完整的世界。', act4: '当"我做不到"再次响起时，换一句新的对白："我只需要画好今天这一帧。明天的事，明天再说。"', act5: '从最简单的动作开始，像画第一笔那样轻。', firstStep: '今天只做一件事，把它当成你"动画的第一帧"——不需要完美，只要开始', newLine: '我只需要画好今天这一帧，明天的事明天再说', backupPlan: '看一部你喜欢的电影或动画，注意主角最困顿的那一刻——你会发现，所有好故事都是从低谷开始的' },
  '庄子': { content: '你此刻的困惑，就像一条鱼望着天空想"我为什么不会飞"。可你有没有想过——游在水里，本来就已经很好了。', act2: '你心里那个声音是不是在说："我必须想清楚""我必须掌控一切"。但庄子告诉你——越想掌控，越被掌控。', act3: '梦蝶的时候我彻底糊涂了：是庄子梦见蝴蝶，还是蝴蝶梦见了庄子？后来我觉得这不重要。重要的是——不管谁梦到谁，都挺好的。', act4: '当焦虑再次抓住你时，换一句台词："且放白鹿青崖间，须行即骑访名山。"——或者更简单点："先不管它。"', act5: '什么都不做，也是一种做。今天试试"无为"的力量。', firstStep: '今天找一个让你烦心的事，刻意不去想它 10 分钟——不是逃避，是练习放下', newLine: '先不管它，让子弹飞一会儿', backupPlan: '躺下来，什么都不做，看天花板 5 分钟。你会发现天不会塌' },
};

function buildCBTMock(characterName: string, question: string) {
  const script = CBT_SCRIPTS[characterName] || CBT_SCRIPTS['庄子'];
  const q = question || '你正在经历的事情';
  return {
    characterName,
    question,
    modules: [
      { index: 1, title: '第一幕：你的处境', content: `你说「${q}」——${script.content}` },
      { index: 2, title: '第二幕：隐藏的台词', content: script.act2 },
      { index: 3, title: '第三幕：换个剧本', content: script.act3 },
      { index: 4, title: '第四幕：新的对白', content: script.act4 },
      { index: 5, title: '第五幕：你的舞台', content: script.act5, action: { firstStep: script.firstStep, emergencyScript: script.newLine, backupPlan: script.backupPlan } },
    ],
  };
}

export async function callLLM(prompt: string): Promise<string> {
  // Stub: returns mock data. Replace with real LLM call (e.g. OpenAI / Anthropic).
  const nameMatch = prompt.match(/你是 (.+?)[。.]/);
  const name = nameMatch ? nameMatch[1] : '';

  // CBT prompt
  if (prompt.includes('CBT') || prompt.includes('modules')) {
    const qMatch = prompt.match(/用户问题："(.+?)"/);
    const question = qMatch ? qMatch[1] : '';
    await new Promise(r => setTimeout(r, 800));
    return JSON.stringify(buildCBTMock(name, question));
  }

  // Roundtable prompt
  await new Promise(r => setTimeout(r, 500));
  if (ROUNDTABLE_MOCK[name]) return JSON.stringify(ROUNDTABLE_MOCK[name]);
  return JSON.stringify({ characterName: name, viewpoint: '一切困境都是暂时的，换个角度看世界。', story: '曾经我也觉得无路可走，但回头看，那些弯路都是必经之路。' });
}

export function extractJSON(raw: string): string {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('LLM 返回中未找到 JSON');
  return raw.slice(start, end + 1);
}
