import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNowPlaying } from './useNowPlaying';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function idleResponse() {
  return Promise.resolve(new Response(JSON.stringify({ isPlaying: false }), { status: 200 }));
}

function playingResponse() {
  return Promise.resolve(new Response(JSON.stringify({
    isPlaying: true,
    track: {
      name: 'Test Track', artist: 'Test Artist', album: 'Test Album',
      albumArtUrl: 'https://example.com/art.jpg', progressMs: 1000, durationMs: 60000,
      trackUrl: 'https://open.spotify.com/track/abc', albumUrl: 'https://stats.fm/album/1',
      artistUrl: 'https://stats.fm/artist/1',
    },
  }), { status: 200 }));
}

describe('useNowPlaying', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in loading state', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useNowPlaying());
    expect(result.current.status).toBe('loading');
  });

  it('transitions to idle when API returns isPlaying false with no prior track', async () => {
    mockFetch.mockImplementation(idleResponse);
    const { result } = renderHook(() => useNowPlaying());
    await waitFor(() => expect(result.current.status).toBe('idle'));
  });

  it('transitions to playing when API returns track', async () => {
    mockFetch.mockImplementation(playingResponse);
    const { result } = renderHook(() => useNowPlaying());
    await waitFor(() => expect(result.current.status).toBe('playing'));
    if (result.current.status === 'playing') {
      expect(result.current.track.name).toBe('Test Track');
      expect(typeof result.current.pollTime).toBe('number');
    }
  });

  it('transitions to paused when playing then API returns isPlaying false', async () => {
    mockFetch
      .mockImplementationOnce(playingResponse)
      .mockImplementation(idleResponse);

    const { result } = renderHook(() => useNowPlaying());
    await waitFor(() => expect(result.current.status).toBe('playing'));

    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(result.current.status).toBe('paused'));
    if (result.current.status === 'paused') {
      expect(result.current.track.name).toBe('Test Track');
    }
  });

  it('transitions to idle after 5 minutes of paused', async () => {
    mockFetch
      .mockImplementationOnce(playingResponse)
      .mockImplementation(idleResponse);

    const { result } = renderHook(() => useNowPlaying());
    await waitFor(() => expect(result.current.status).toBe('playing'));

    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(result.current.status).toBe('paused'));

    vi.advanceTimersByTime(5 * 60 * 1000);
    await waitFor(() => expect(result.current.status).toBe('idle'));
  });

  it('keeps previous state on 500 error', async () => {
    mockFetch
      .mockImplementationOnce(playingResponse)
      .mockImplementation(() => Promise.resolve(new Response('error', { status: 500 })));

    const { result } = renderHook(() => useNowPlaying());
    await waitFor(() => expect(result.current.status).toBe('playing'));

    vi.advanceTimersByTime(500);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(result.current.status).toBe('playing');
  });

  it('polls every 500ms', async () => {
    mockFetch.mockImplementation(idleResponse);
    renderHook(() => useNowPlaying());
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    vi.advanceTimersByTime(500);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    vi.advanceTimersByTime(500);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
  });
});
