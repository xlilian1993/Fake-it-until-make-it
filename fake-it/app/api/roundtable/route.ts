import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/llm';
import { buildRoundTablePrompt } from '@/lib/prompts';
import type { RoundTableResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { characterNames, question } = await request.json();

    if (!characterNames || !Array.isArray(characterNames) || characterNames.length !== 3) {
      return NextResponse.json(
        { error: '需要 3 个角色名' },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: 'question 字段必填' },
        { status: 400 }
      );
    }

    const prompt = buildRoundTablePrompt(characterNames, question);
    const rawResponse = await callLLM(prompt);
    const jsonStr = extractJSON(rawResponse);

    let parsed: RoundTableResponse;
    try {
      parsed = JSON.parse(jsonStr) as RoundTableResponse;
    } catch {
      return NextResponse.json(
        { error: 'LLM 返回格式错误', raw: rawResponse.slice(0, 500) },
        { status: 502 }
      );
    }

    if (!parsed.perspectives || !Array.isArray(parsed.perspectives)) {
      return NextResponse.json(
        { error: 'LLM 返回结构不完整', raw: rawResponse.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
