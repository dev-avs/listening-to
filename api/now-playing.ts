import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Track } from '../src/types';

interface StatsfmArtist { id: number; name: string }
interface StatsfmAlbum { id: number; name: string; image: string }
interface StatsfmTrack {
  name: string;
  durationMs: number;
  artists: StatsfmArtist[];
  albums: StatsfmAlbum[];
  externalIds: { spotify?: string[] };
}
interface StatsfmCurrentlyPlaying {
  isPlaying: boolean;
  progressMs: number;
  track: StatsfmTrack;
}

interface StatsfmResponse {
  item: StatsfmCurrentlyPlaying | null;
}

type NowPlayingResult =
  | { isPlaying: false }
  | { isPlaying: true; track: Track };

export async function fetchNowPlaying(username: string): Promise<NowPlayingResult> {
  const res = await fetch(`https://api.stats.fm/api/v1/users/${encodeURIComponent(username)}/streams/current`);

  if (res.status === 204) return { isPlaying: false };
  if (!res.ok) throw new Error(`stats.fm error: ${res.status}`);

  const { item } = await res.json() as StatsfmResponse;

  if (!item || !item.isPlaying) return { isPlaying: false };

  return {
    isPlaying: true,
    track: {
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', '),
      album: item.track.albums[0]?.name ?? '',
      albumArtUrl: item.track.albums[0]?.image ?? '',
      progressMs: item.progressMs,
      durationMs: item.track.durationMs,
      trackUrl: `https://open.spotify.com/track/${item.track.externalIds.spotify?.[0] ?? ''}`,
      albumUrl: `https://stats.fm/album/${item.track.albums[0]?.id ?? ''}`,
      artistUrl: `https://stats.fm/artist/${item.track.artists[0]?.id ?? ''}`,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { STATSFM_USERNAME } = process.env;

  if (!STATSFM_USERNAME) {
    return res.status(500).json({ error: 'Missing STATSFM_USERNAME' });
  }

  try {
    const result = await fetchNowPlaying(STATSFM_USERNAME);
    res.setHeader('Cache-Control', 'no-store');
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'stats.fm API error' });
  }
}
