import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/llm';
import { buildRecommendPrompt } from '@/lib/prompts';
import type { RecommendResult } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'question 字段必填' },
        { status: 400 }
      );
    }

    const prompt = buildRecommendPrompt(question);
    const rawResponse = await callLLM(prompt);
    const jsonStr = extractJSON(rawResponse);

    let parsed: RecommendResult;
    try {
      parsed = JSON.parse(jsonStr) as RecommendResult;
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : 'unknown';
      return NextResponse.json(
        {
          error: 'LLM 返回格式错误',
          detail: msg,
          extracted: jsonStr.slice(0, 500),
          raw: rawResponse.slice(0, 500),
        },
        { status: 502 }
      );
    }

    if (!parsed.characters || !Array.isArray(parsed.characters)) {
      return NextResponse.json(
        { error: 'LLM 返回结构不完整，缺少 characters 数组', raw: rawResponse.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}