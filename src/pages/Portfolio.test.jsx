import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Portfolio from './Portfolio';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

const mockFeatures = [
    { id: 1, title: 'Feature A', pledged_amount: 100, votes: 10, status: 'live', hype_score: 110, category: 'AI', current_price: 2.10 },
    { id: 2, title: 'Feature B', pledged_amount: 50, votes: 5, status: 'planned', hype_score: 55, category: 'Mobile', current_price: 1.50 }
];

describe('Portfolio Component', () => {
    beforeEach(() => {
        fetch.mockClear();
        localStorage.clear();
    });

    test('renders empty state when no portfolio', async () => {
        render(
            <MemoryRouter>
                <Portfolio />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No Assets Found')).toBeInTheDocument();
        });
    });

    test('renders portfolio items from localStorage', async () => {
        // Legacy format: Array of IDs. Component/Utils should migrate this to 1 share @ 0 cost.
        localStorage.setItem('my_portfolio', JSON.stringify([1]));

        fetch.mockResolvedValueOnce({
            json: async () => ({ data: mockFeatures })
        });

        render(
            <MemoryRouter>
                <Portfolio />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Feature A')).toBeInTheDocument();
            // Feature B should not show
            expect(screen.queryByText('Feature B')).not.toBeInTheDocument();
        });

        // Check Value Calculation
        // 1 Share * $2.10 price = $2.10
        // It appears multiple times (Current Price, Market Value)
        const prices = screen.getAllByText('$2.10');
        expect(prices.length).toBeGreaterThan(0);
    });
});
