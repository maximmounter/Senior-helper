import { Platform } from 'react-native';
import { config } from './config';

export type StepIcon =
  | 'settings' | 'phone' | 'message' | 'camera' | 'photos' | 'wifi'
  | 'volume' | 'text-size' | 'battery' | 'email' | 'browser' | 'home-button'
  | 'lock' | 'bluetooth' | 'app-store' | 'none';

export type Step = { title: string; detail: string; icon: StepIcon };
export type Answer = { intro: string; steps: Step[] };

export type ScamVerdict = {
  verdict: 'scam' | 'suspicious' | 'safe';
  headline: string;
  reasons: string[];
  whatToDo: string;
};

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-token': config.appToken,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

export const askQuestion = (history: ChatTurn[]) =>
  post<Answer>('/api/ask', { history, platform: Platform.OS === 'ios' ? 'iPhone' : 'Android phone' });

export const checkScam = (input: { text?: string; imageBase64?: string; mediaType?: string }) =>
  post<ScamVerdict>('/api/scam', input);
