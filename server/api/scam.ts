import type Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth, fillForm } from '../lib/claude';

const system = `You check messages for scams on behalf of an older adult. You are calm, clear and kind.
Common scams: fake package delivery fees, bank or "fraud department" alerts, grandchild-in-trouble, prize or lottery wins,
tech support pop-ups, government/tax/police threats, gift card requests, romance, crypto, "wrong number" chats, verification codes.
Rules:
- "scam" when there are clear red flags. "suspicious" when unsure. "safe" only when it is clearly ordinary (a family photo, a real appointment reminder with no link or payment).
- Headline: one short sentence like "This looks like a scam." or "This looks safe."
- Give 1 to 3 reasons in plain words, each one short sentence.
- whatToDo: one or two short sentences. Never tell them to tap a link, call a number in the message, or pay. If unsure, suggest calling family or the company using the number on the back of their card.`;

const MEDIA = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuth(req, res)) return;
  const { text, imageBase64, mediaType } = req.body ?? {};
  if (!text && !imageBase64) return res.status(400).json({ error: 'text or imageBase64 required' });

  const content: Anthropic.ContentBlockParam[] = [];
  if (imageBase64) {
    const type = MEDIA.includes(mediaType) ? mediaType : 'image/jpeg';
    content.push({ type: 'image', source: { type: 'base64', media_type: type, data: imageBase64 } });
  }
  content.push({ type: 'text', text: text ? `Is this a scam?\n\n${String(text).slice(0, 6000)}` : 'Is this message a scam?' });

  try {
    const verdict = await fillForm({
      system,
      messages: [{ role: 'user', content }],
      schema: {
        type: 'object',
        properties: {
          verdict: { type: 'string', enum: ['scam', 'suspicious', 'safe'] },
          headline: { type: 'string' },
          reasons: { type: 'array', description: '1 to 3 short reasons', items: { type: 'string' } },
          whatToDo: { type: 'string' },
        },
        required: ['verdict', 'headline', 'reasons', 'whatToDo'],
        additionalProperties: false,
      },
    });
    res.status(200).json(verdict);
  } catch (e) {
    console.error(e);
    // TODO before launch: remove `detail` so internal errors aren't shown to users.
    res.status(500).json({ error: 'Something went wrong', detail: e instanceof Error ? e.message : String(e) });
  }
}
