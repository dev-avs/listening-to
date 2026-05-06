import { useNowPlaying } from './hooks/useNowPlaying';
import { AmbientBackground } from './components/AmbientBackground';
import { PlayerCard } from './components/PlayerCard';
import { NothingPlaying } from './components/NothingPlaying';

export function App() {
  const state = useNowPlaying();
  const albumArtUrl = (state.status === 'playing' || state.status === 'paused')
    ? state.track.albumArtUrl
    : null;

  return (
    <>
      <AmbientBackground albumArtUrl={albumArtUrl} />
      {state.status === 'playing' && (
        <PlayerCard track={state.track} pollTime={state.pollTime} />
      )}
      {state.status === 'paused' && (
        <PlayerCard track={state.track} />
      )}
      {state.status === 'idle' && <NothingPlaying />}
    </>
  );
}
