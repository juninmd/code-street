import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Portfolio from './Portfolio';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

const mockFeatures = [
    { id: 1, title: 'Feature A', pledged_amount: 100, votes: 10, status: 'live', hype_score: 110, category: 'AI' },
    { id: 2, title: 'Feature B', pledged_amount: 50, votes: 5, status: 'planned', hype_score: 55, category: 'Mobile' }
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
        // Feature A: 100 pledged.
        expect(screen.getByText('$100')).toBeInTheDocument();
    });
});
