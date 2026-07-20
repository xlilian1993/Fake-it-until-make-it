import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 60;

function buildPrompt(
  characterName: string,
  question: string,
  previousList?: { name: string; viewpoint: string; story: string }[]
): string {
  if (!previousList || previousList.length === 0) {
    return `你是 ${characterName}。正在参加一场圆桌讨论，你是第一个发言的人。

用户问题："${question}"

请用你的第一人称，给出你的核心立场和一段相关经历。返回 JSON（不要其他文字）：

{
  "characterName": "${characterName}",
  "viewpoint": "一句话表达你对这个问题的核心立场",
  "story": "用你的口吻讲述一个相关经历，2-3句话"
}`;
  }

  const previousText = previousList.map((p, i) =>
    `第${i + 1}位发言的是 ${p.name}，Ta 的观点是："${p.viewpoint}"，Ta 分享的经历是："${p.story}"`
  ).join('\n\n');

  const lastName = previousList[previousList.length - 1].name;

  return `你是 ${characterName}。正在参加一场圆桌讨论。

用户问题："${question}"

在你之前已有 ${previousList.length} 位发言：

${previousText}

现在轮到你了。请先针对上面各位（尤其是 ${lastName}）的发言做简短回应（一句），再给出你自己的核心立场和相关经历。返回 JSON（不要其他文字）：

{
  "characterName": "${characterName}",
  "viewpoint": "先回应前几位（一句），再给出你的核心立场（一句）",
  "story": "用你的口吻讲述一个相关经历，2-3句话"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const { characterName, question, previous } = await request.json();

    if (!characterName || !question) {
      return NextResponse.json(
        { error: 'characterName 和 question 字段必填' },
        { status: 400 }
      );
    }

    const prevList = previous || undefined;
    const prompt = buildPrompt(characterName, question, prevList ? (Array.isArray(prevList) ? prevList : [prevList]) : undefined);
    const raw = await callLLM(prompt);
    const json = extractJSON(raw);
    const perspective = JSON.parse(json);

    return NextResponse.json({ perspective });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}