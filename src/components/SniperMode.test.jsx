import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SniperMode from './SniperMode';

jest.useFakeTimers();

describe('SniperMode', () => {
  it('identifies the best target based on votes/pledge ratio', async () => {
    const features = [
        { id: 1, title: 'Bad Feature', votes: 10, pledged_amount: 100, current_price: 1 }, // Ratio: 0.1
        { id: 2, title: 'Good Feature', votes: 100, pledged_amount: 50, current_price: 1 }, // Ratio: 2.0 (Target)
        { id: 3, title: 'Okay Feature', votes: 50, pledged_amount: 100, current_price: 1 }, // Ratio: 0.5
    ];

    render(<SniperMode features={features} onClose={() => {}} />);

    expect(screen.getByText('SCANNING MARKET DATA...')).toBeInTheDocument();

    // Fast-forward scanning
    act(() => {
        jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Target Acquired')).toBeInTheDocument();
    expect(screen.getByText('Good Feature')).toBeInTheDocument();
    expect(screen.getByText('100 Votes')).toBeInTheDocument();
  });

  it('handles empty features gracefully', () => {
      render(<SniperMode features={[]} onClose={() => {}} />);
      // Should show scanning then maybe fail to find target, but not crash
      act(() => {
          jest.advanceTimersByTime(2000);
      });
  });
});
