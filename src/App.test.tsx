import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { App } from './App';
import type { NowPlayingState } from './types';

vi.mock('./hooks/useNowPlaying');
vi.mock('./components/AmbientBackground', () => ({
  AmbientBackground: () => <div data-testid="ambient" />,
}));

import { useNowPlaying } from './hooks/useNowPlaying';
const mockUseNowPlaying = vi.mocked(useNowPlaying);

const track = {
  name: 'Test Track', artist: 'Artist', album: 'Album',
  albumArtUrl: 'https://example.com/art.jpg', progressMs: 0, durationMs: 60000,
  trackUrl: 'https://open.spotify.com/track/abc', albumUrl: 'https://stats.fm/album/1',
  artistUrl: 'https://stats.fm/artist/1',
};

describe('App', () => {
  it('renders nothing while loading', () => {
    mockUseNowPlaying.mockReturnValue({ status: 'loading' });
    const { container } = render(<App />);
    expect(screen.queryByText('not listening')).not.toBeInTheDocument();
    expect(container.querySelector('.widget')).not.toBeInTheDocument();
  });

  it('renders NothingPlaying when idle', () => {
    mockUseNowPlaying.mockReturnValue({ status: 'idle' });
    render(<App />);
    expect(screen.getByText('not listening to anything right now')).toBeInTheDocument();
  });

  it('renders PlayerCard when playing', () => {
    const state: NowPlayingState = { status: 'playing', track, pollTime: Date.now() };
    mockUseNowPlaying.mockReturnValue(state);
    render(<App />);
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });

  it('renders PlayerCard when paused', () => {
    const state: NowPlayingState = { status: 'paused', track };
    mockUseNowPlaying.mockReturnValue(state);
    render(<App />);
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });
});
