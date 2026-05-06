import { render } from '@testing-library/react';
import { AmbientBackground } from './AmbientBackground';

describe('AmbientBackground', () => {
  it('renders exactly two canvases', () => {
    render(<AmbientBackground albumArtUrl={null} />);
    const canvases = document.querySelectorAll('canvas.bg-canvas');
    expect(canvases).toHaveLength(2);
  });

  it('both canvases start with opacity 0', () => {
    render(<AmbientBackground albumArtUrl={null} />);
    const canvases = document.querySelectorAll('canvas.bg-canvas');
    canvases.forEach(cv => {
      expect((cv as HTMLElement).style.opacity).toBe('0');
    });
  });
});
