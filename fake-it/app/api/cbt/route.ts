import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/llm';
import { buildCBTPrompt } from '@/lib/prompts';
import type { CBTResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { characterName, question } = await request.json();

    if (!characterName || !question) {
      return NextResponse.json(
        { error: 'characterName 和 question 字段必填' },
        { status: 400 }
      );
    }

    const prompt = buildCBTPrompt(characterName, question);
    const rawResponse = await callLLM(prompt);
    const jsonStr = extractJSON(rawResponse);

    let parsed: CBTResponse;
    try {
      parsed = JSON.parse(jsonStr) as CBTResponse;
    } catch {
      return NextResponse.json(
        { error: 'LLM 返回格式错误', raw: rawResponse.slice(0, 500) },
        { status: 502 }
      );
    }

    if (!parsed.modules || !Array.isArray(parsed.modules)) {
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
