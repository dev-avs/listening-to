import { render, screen } from '@testing-library/react';
import { NothingPlaying } from './NothingPlaying';

describe('NothingPlaying', () => {
  it('renders idle message', () => {
    render(<NothingPlaying />);
    expect(screen.getByText('not listening to anything right now')).toBeInTheDocument();
  });
});
