import { render } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('sets width to correct percentage of duration', () => {
    render(<ProgressBar progressMs={30000} durationMs={120000} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('25%');
  });

  it('renders 0% when durationMs is 0', () => {
    render(<ProgressBar progressMs={0} durationMs={0} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('clamps to 100% when progress exceeds duration', () => {
    render(<ProgressBar progressMs={130000} durationMs={120000} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });
});
