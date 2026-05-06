export interface Track {
  name: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  progressMs: number;
  durationMs: number;
  trackUrl: string;
  albumUrl: string;
  artistUrl: string;
}

export type NowPlayingState =
  | { status: 'loading' }
  | { status: 'playing'; track: Track; pollTime: number }
  | { status: 'paused'; track: Track }
  | { status: 'idle' };
