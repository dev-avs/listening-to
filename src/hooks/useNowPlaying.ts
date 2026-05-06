import { useEffect, useRef, useState } from 'react';
import type { NowPlayingState, Track } from '../types';

const POLL_INTERVAL = 500;
const IDLE_AFTER_MS = 5 * 60 * 1000;

interface ApiResponse {
  isPlaying: boolean;
  track?: Track;
}

export function useNowPlaying(): NowPlayingState {
  const [state, setState] = useState<NowPlayingState>({ status: 'loading' });
  const pausedSinceRef = useRef<number | null>(null);
  const lastTrackRef = useRef<Track | null>(null);

  useEffect(() => {
    async function poll() {
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await fetch('/api/now-playing');
        if (!res.ok) return;
        const data = await res.json() as ApiResponse;

        if (data.isPlaying && data.track) {
          pausedSinceRef.current = null;
          lastTrackRef.current = data.track;
          setState({ status: 'playing', track: data.track, pollTime: Date.now() });
        } else {
          if (pausedSinceRef.current === null) {
            pausedSinceRef.current = Date.now();
          }
          const pausedMs = Date.now() - pausedSinceRef.current;
          if (pausedMs >= IDLE_AFTER_MS || !lastTrackRef.current) {
            setState({ status: 'idle' });
          } else {
            setState({ status: 'paused', track: lastTrackRef.current });
          }
        }
      } catch {
        // network error — keep previous state
      }
    }

    poll();
    const id = window.setInterval(poll, POLL_INTERVAL);

    function onVisible() {
      if (document.visibilityState === 'visible') poll();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return state;
}
