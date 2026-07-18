// LLM 调用封装（OpenAI 兼容格式）

interface LLMConfig {
  name: string;
  model: string;
  apiKey: string;
  baseURL?: string;
}

export const LLM_CONFIG: LLMConfig = {
  name: process.env.LLM_NAME || 'default',
  model: process.env.LLM_MODEL || 'gpt-4o-mini',
  apiKey: process.env.LLM_KEY || '',
  baseURL: process.env.LLM_BASE,
};

export async function callLLM(prompt: string): Promise<string> {
  if (!LLM_CONFIG.apiKey) {
    throw new Error('LLM_KEY 未配置，请在 .env.local 中设置');
  }

  const baseURL = (LLM_CONFIG.baseURL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const url = `${baseURL}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM 调用失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export function extractJSON(text: string): string {
  let cleaned = text;

  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) cleaned = codeBlockMatch[1];

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  let start = firstBrace;
  let end = lastBrace;
  if (firstBracket !== -1 && (firstBracket < firstBrace || firstBrace === -1)) {
    start = firstBracket; end = lastBracket;
  }
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  cleaned = cleaned.replace(/\u201C/g, '"').replace(/\u201D/g, '"');
  cleaned = cleaned.replace(/\u2018/g, "'").replace(/\u2019/g, "'");

  return cleaned.trim();
}