import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNowPlaying } from './now-playing';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const USERNAME = 'testuser';

function makeResponse(item: object | null) {
  return new Response(JSON.stringify({ item }), { status: 200 });
}

const playingItem = {
  isPlaying: true,
  progressMs: 26000,
  track: {
    name: 'Never Gonna Give You Up',
    durationMs: 187000,
    artists: [{ id: 789, name: 'Rick Astley' }],
    albums: [{ id: 456, name: 'Whenever You Need Somebody', image: 'https://example.com/art.jpg' }],
    externalIds: { spotify: ['abc123'] },
  },
};

describe('fetchNowPlaying', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns isPlaying false when stats.fm returns 204', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const result = await fetchNowPlaying(USERNAME);
    expect(result).toEqual({ isPlaying: false });
  });

  it('returns isPlaying false when item is null', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(null));
    const result = await fetchNowPlaying(USERNAME);
    expect(result).toEqual({ isPlaying: false });
  });

  it('returns isPlaying false when isPlaying is false', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ ...playingItem, isPlaying: false }));
    const result = await fetchNowPlaying(USERNAME);
    expect(result).toEqual({ isPlaying: false });
  });

  it('returns normalized track with spotify and album urls', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(playingItem));
    const result = await fetchNowPlaying(USERNAME);
    expect(result).toEqual({
      isPlaying: true,
      track: {
        name: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        album: 'Whenever You Need Somebody',
        albumArtUrl: 'https://example.com/art.jpg',
        progressMs: 26000,
        durationMs: 187000,
        trackUrl: 'https://open.spotify.com/track/abc123',
        albumUrl: 'https://stats.fm/album/456',
        artistUrl: 'https://stats.fm/artist/789',
      },
    });
  });

  it('joins multiple artists with comma', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({
      isPlaying: true,
      progressMs: 0,
      track: {
        name: 'Collab',
        durationMs: 60000,
        artists: [{ id: 1, name: 'Artist A' }, { id: 2, name: 'Artist B' }],
        albums: [{ id: 1, name: 'Album', image: 'https://example.com/a.jpg' }],
        externalIds: { spotify: ['xyz'] },
      },
    }));
    const result = await fetchNowPlaying(USERNAME);
    expect(result).toMatchObject({ track: { artist: 'Artist A, Artist B' } });
  });

  it('throws when stats.fm returns an error status', async () => {
    mockFetch.mockResolvedValueOnce(new Response('error', { status: 500 }));
    await expect(fetchNowPlaying(USERNAME)).rejects.toThrow('stats.fm error: 500');
  });

  it('encodes username in URL', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await fetchNowPlaying('user name');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.stats.fm/api/v1/users/user%20name/streams/current'
    );
  });
});
