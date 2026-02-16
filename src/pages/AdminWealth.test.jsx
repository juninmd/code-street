import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminWealth from './AdminWealth';

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn());

global.fetch = jest.fn();

describe('AdminWealth', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders stats and calculates ARR correctly', async () => {
    fetch.mockImplementation((url) => {
        if (url === '/api/stats') {
            return Promise.resolve({
                json: () => Promise.resolve({
                    platform_revenue: 100,
                    total_payout: 5000,
                    active_bounty: 2000
                })
            });
        }
        if (url === '/api/pledges/recent') {
            return Promise.resolve({
                json: () => Promise.resolve({ data: [] })
            });
        }
        if (url === '/api/features') {
            return Promise.resolve({
                json: () => Promise.resolve({ data: [] })
            });
        }
    });

    await act(async () => {
        render(<AdminWealth />);
    });

    // Revenue
    expect(screen.getByText('$100.00')).toBeInTheDocument();

    // ARR: 100 * 12 = 1200
    // The format is $1,200.00
    expect(screen.getByText('$1,200.00')).toBeInTheDocument();
  });

  it('handles cash out logic', async () => {
    fetch.mockImplementation((url) => {
        if (url === '/api/stats') {
            return Promise.resolve({
                json: () => Promise.resolve({
                    platform_revenue: 500,
                })
            });
        }
        return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
    });

    jest.useFakeTimers();

    await act(async () => {
        render(<AdminWealth />);
    });

    const cashOutBtn = screen.getByText('Payout to Bank');
    fireEvent.click(cashOutBtn);

    expect(screen.getByText('Processing...')).toBeInTheDocument();

    await act(async () => {
        jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Transferred')).toBeInTheDocument();

    // Revenue should reset to 0 in UI.
    // It might appear multiple times (Revenue and ARR), so we check getAllByText
    const zeroAmounts = screen.getAllByText('$0.00');
    expect(zeroAmounts.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });
});
