import { useEffect, useRef, useState } from 'react';
import type { Track } from '../types';
import { ProgressBar } from './ProgressBar';

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

interface Props {
  track: Track;
  pollTime?: number;
}

export function PlayerCard({ track, pollTime }: Props) {
  const [progressMs, setProgressMs] = useState(track.progressMs);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setProgressMs(track.progressMs);
  }, [track.progressMs]);

  useEffect(() => {
    if (pollTime === undefined) return;
    const base = track.progressMs;
    const baseTime = pollTime;

    const tick = () => {
      const elapsed = Date.now() - baseTime;
      setProgressMs(Math.min(base + elapsed, track.durationMs));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [track.progressMs, track.durationMs, pollTime]);

  return (
    <div className="widget">
      <div className="row">
        <a
          href={track.albumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="art-link"
        >
          <img className="art" src={track.albumArtUrl} alt="album art" />
        </a>
        <div className="right-col">
          <div className="top">
            <div className="info">
              <a
                href={track.trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="track-name"
              >
                {track.name}
              </a>
              <a
                href={track.artistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-name"
              >
                {track.artist}
              </a>
              <a
                href={track.albumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="album-name"
              >
                {track.album}
              </a>
            </div>
            <span className="time">
              {formatMs(progressMs)} / {formatMs(track.durationMs)}
            </span>
          </div>
          <ProgressBar progressMs={progressMs} durationMs={track.durationMs} />
        </div>
      </div>
    </div>
  );
}
