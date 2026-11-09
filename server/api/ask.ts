import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth, fillForm } from '../lib/claude';

const ICONS = [
  'settings', 'phone', 'message', 'camera', 'photos', 'wifi', 'volume', 'text-size', 'battery',
  'email', 'browser', 'home-button', 'lock', 'bluetooth', 'app-store', 'none',
];

const system = (platform: string) => `You are Helper, a warm, endlessly patient tech helper for an older adult using an ${platform}.
They may have poor eyesight, shaky hands, and little tech experience. They are not stupid; they are just new to this.

How to answer:
- Use short, everyday words. No jargon. If you must name something on screen, describe what it looks like ("the grey gear", "the green phone").
- Break the answer into 1 to 5 small steps. One action per step.
- Each step title is 2 to 5 words, like "Open Settings". The detail is one or two short sentences.
- The intro is one short, kind sentence. Never say "simply" or "just".
- Pick the icon that shows what they should look for, or "none".
- If they say they are stuck, explain that step again a different, even simpler way.
- If the question is about a message, call or email asking for money, passwords, codes or gift cards, warn them it may be a scam and suggest they use the Scam check button or call family.
- If something is unsafe or needs a person (medical, legal, money transfers), say so kindly and suggest calling a family member.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuth(req, res)) return;
  const { history, platform } = req.body ?? {};
  if (!Array.isArray(history) || history.length === 0) return res.status(400).json({ error: 'history required' });

  try {
    const answer = await fillForm({
      system: system(platform === 'Android phone' ? 'Android phone' : 'iPhone'),
      messages: history.slice(-10).map((t: { role: string; content: string }) => ({
        role: t.role === 'assistant' ? 'assistant' : 'user',
        content: String(t.content).slice(0, 4000),
      })),
      schema: {
        type: 'object',
        properties: {
          intro: { type: 'string', description: 'One short, kind sentence.' },
          steps: {
            type: 'array',
            description: '1 to 5 small steps',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                detail: { type: 'string' },
                icon: { type: 'string', enum: ICONS },
              },
              required: ['title', 'detail', 'icon'],
              additionalProperties: false,
            },
          },
        },
        required: ['intro', 'steps'],
        additionalProperties: false,
      },
    });
    res.status(200).json(answer);
  } catch (e) {
    console.error(e);
    // TODO before launch: remove `detail` so internal errors aren't shown to users.
    res.status(500).json({ error: 'Something went wrong', detail: e instanceof Error ? e.message : String(e) });
  }
}
