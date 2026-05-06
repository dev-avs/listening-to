import { render, screen } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';
import type { Track } from '../types';

const track: Track = {
  name: 'Never Gonna Give You Up',
  artist: 'Rick Astley',
  album: 'Whenever You Need Somebody',
  albumArtUrl: 'https://example.com/art.jpg',
  progressMs: 26000,
  durationMs: 187000,
  trackUrl: 'https://open.spotify.com/track/abc123',
  albumUrl: 'https://stats.fm/album/456',
  artistUrl: 'https://stats.fm/artist/789',
};

describe('PlayerCard', () => {
  it('renders track name', () => {
    render(<PlayerCard track={track} />);
    expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument();
  });

  it('renders artist name', () => {
    render(<PlayerCard track={track} />);
    expect(screen.getByText('Rick Astley')).toBeInTheDocument();
  });

  it('renders album name', () => {
    render(<PlayerCard track={track} />);
    expect(screen.getByText('Whenever You Need Somebody')).toBeInTheDocument();
  });

  it('renders formatted time as progress/duration', () => {
    render(<PlayerCard track={track} />);
    expect(screen.getByText('0:26 / 3:07')).toBeInTheDocument();
  });

  it('renders album art with correct src', () => {
    render(<PlayerCard track={track} />);
    const img = screen.getByRole('img', { name: 'album art' });
    expect(img).toHaveAttribute('src', 'https://example.com/art.jpg');
  });

  it('track name links to spotify', () => {
    render(<PlayerCard track={track} />);
    const link = screen.getByRole('link', { name: 'Never Gonna Give You Up' });
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/track/abc123');
  });

  it('artist name links to stats.fm artist', () => {
    render(<PlayerCard track={track} />);
    const link = screen.getByRole('link', { name: 'Rick Astley' });
    expect(link).toHaveAttribute('href', 'https://stats.fm/artist/789');
  });

  it('album name links to stats.fm album', () => {
    render(<PlayerCard track={track} />);
    const link = screen.getByRole('link', { name: 'Whenever You Need Somebody' });
    expect(link).toHaveAttribute('href', 'https://stats.fm/album/456');
  });
});
