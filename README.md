# Helper

A calm, simple tech helper for seniors. Adult children buy it so their parent can ask questions anytime instead of calling for tech support.

## What's here

- `App.tsx`, `src/`: the phone app (Expo, iPhone + Android)
  - `src/screens/ChatScreen.tsx`: the chat home screen
  - `src/screens/ScamScreen.tsx`: "Is this a scam?"
  - `src/config.ts`: senior's name, family name and phone (placeholders for now)
  - `src/theme.ts`: colors, font, text sizes
- `server/`: the backend that talks to Claude (deploys to Vercel)
  - `server/api/ask.ts`: step-by-step answers
  - `server/api/scam.ts`: scam checks (text or screenshot)

## Run it

1. `npm install` (in this folder) and `cd server && npm install`
2. Deploy `server/` to Vercel and set `ANTHROPIC_API_KEY` and `APP_TOKEN`
3. Copy `.env.example` to `.env` and fill in your Vercel URL and the same `APP_TOKEN`
4. `npx expo start`, then scan the QR code with the Expo Go app on your phone

## Before launch (not built yet)

- Real sign-in and family linking (Supabase); remove `EXPO_PUBLIC_APP_TOKEN`
- Family dashboard and scam alerts
- Subscriptions (RevenueCat), privacy policy, in-app account deletion
