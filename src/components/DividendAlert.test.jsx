import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import DividendAlert from './DividendAlert';
import * as portfolioUtils from '../utils/portfolio';
import * as hapticsUtils from '../utils/haptics';

// Mock dependencies
jest.mock('../utils/portfolio');
jest.mock('../utils/haptics');
jest.mock('canvas-confetti', () => jest.fn());

// Mock Fetch
global.fetch = jest.fn();

describe('DividendAlert', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    portfolioUtils.getPortfolio.mockReturnValue([{ id: 1, shares: 10 }]); // 10 shares
  });

  it('should not show alert if no dividends', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
    });

    await act(async () => {
        render(<DividendAlert />);
    });

    expect(screen.queryByText(/Dividend Payout Received/)).toBeNull();
  });

  it('should process new dividend', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            data: [{ id: 100, amount_per_share: 0.5, created_at: '2023-01-01' }]
        })
    });

    await act(async () => {
        render(<DividendAlert />);
    });

    // Expect payout = 10 shares * 0.5 = $5.00
    await waitFor(() => {
        expect(screen.getByText(/Dividend Payout Received/)).toBeInTheDocument();
        expect(screen.getByText(/\$5.00/)).toBeInTheDocument();
    });

    expect(localStorage.getItem('cash_balance')).toBe('5');
    expect(localStorage.getItem('last_dividend_id')).toBe('100');
    expect(hapticsUtils.triggerHaptic).toHaveBeenCalledWith('success');
  });

  it('should ignore already seen dividend', async () => {
    localStorage.setItem('last_dividend_id', '100');
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            data: [{ id: 100, amount_per_share: 0.5 }]
        })
    });

    await act(async () => {
        render(<DividendAlert />);
    });

    expect(screen.queryByText(/Dividend Payout Received/)).toBeNull();
    expect(localStorage.getItem('cash_balance')).toBeNull(); // Should not change
  });
});
