# listening-to

A public webpage that shows what you're currently listening to on Spotify — no login required for visitors. Powered by [stats.fm](https://stats.fm), hosted on Vercel.

**Live example:** `your-project.vercel.app`

## How it works

```
Visitor browser
  → polls GET /api/now-playing every 3s
  → Vercel serverless function
      → fetches stats.fm /users/{username}/streams/current
      → returns normalized JSON
  → React updates PlayerCard + ambient background
```

Your stats.fm profile must be public. Visitors never touch stats.fm directly — the serverless function proxies it.

## Setup

### 1. Create a stats.fm account

1. Go to [stats.fm](https://stats.fm) and sign up
2. Connect your Spotify account
3. Go to **Settings → Privacy** and set your profile to **Public**
4. Note your stats.fm username (shown in your profile URL: `stats.fm/u/yourname`)

### 2. Deploy to Vercel

1. Fork or clone this repo to your GitHub account
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework preset auto-detects as **Vite** — no changes needed
4. Click **Deploy**

### 3. Add the environment variable

In the Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `STATSFM_USERNAME` | Your stats.fm username |

Set environment to **Production** (and **Preview** if you want).

### 4. Redeploy

Vercel dashboard → **Deployments** → latest → **Redeploy**.  
Or push an empty commit:

```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

### 5. Verify

Open your Vercel URL. Start playing something on Spotify. Within 3 seconds the card should appear with album art and ambient background.

Test the API directly: `https://your-project.vercel.app/api/now-playing`

## Running locally

```bash
npm install
npm run dev
```

The frontend loads at `http://localhost:5173`. The API won't work locally without a Vercel dev environment — the page stays blank (loading state) which is expected.

To test the API locally, use [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel dev
```

Then set `STATSFM_USERNAME` in a `.env.local` file (copy `.env.example`).

## Project structure

```
api/
  now-playing.ts          — Vercel serverless function
src/
  App.tsx                 — state router (loading / playing / idle)
  types.ts                — Track, NowPlayingState types
  hooks/
    useNowPlaying.ts      — 3s polling hook, visibility-aware
  components/
    PlayerCard.tsx        — glassmorphism card with album art
    AmbientBackground.tsx — canvas ping-pong crossfade background
    ProgressBar.tsx       — snaps to API progress on each poll
    NothingPlaying.tsx    — shown when nothing is playing
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + build for production |
| `npm test` | Run all tests |

## Behaviour details

- Polls every 3 seconds
- Pauses polling when the browser tab is hidden, resumes on focus
- On API error (500, network): keeps showing last known track, retries next poll
- When nothing is playing: ambient background fades out, idle message shown
- Progress bar snaps to API value each poll — no client-side interpolation

## Tech stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [Vercel](https://vercel.com) (frontend + serverless API)
- [stats.fm](https://stats.fm) (Spotify scrobbling data)
- [Vitest](https://vitest.dev) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
