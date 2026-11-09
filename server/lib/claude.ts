import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from Vercel env vars
export const MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-5-5';

// Simple shared token so random people can't use your API key.
// Replace with real per-user sign-in (Supabase) before launch.
export function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return false;
  }
  const expected = process.env.APP_TOKEN;
  if (expected && req.headers['x-app-token'] !== expected) {
    res.status(401).json({ error: 'Not allowed' });
    return false;
  }
  return true;
}

// Ask Claude for an answer that always matches a fixed JSON shape (structured outputs),
// so the app always gets clean data it can show as big steps.
export async function fillForm<T>(opts: {
  system: string;
  messages: Anthropic.MessageParam[];
  schema: Record<string, unknown>;
}): Promise<T> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: opts.system,
    messages: opts.messages,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: opts.schema } },
  });
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  if (!json) throw new Error(`No JSON in answer (stop_reason: ${msg.stop_reason})`);
  return JSON.parse(json) as T;
}
