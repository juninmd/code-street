import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MarketInsider from './MarketInsider';
import '@testing-library/jest-dom';

const mockFeatures = [
    { id: 1, title: 'Undervalued Gem', votes: 10, pledged_amount: 10, status: 'under_review', category: 'Backend' },
    { id: 2, title: 'Big Mover', votes: 50, pledged_amount: 500, status: 'under_review', category: 'Frontend' },
    { id: 3, title: 'Live Feature', votes: 100, pledged_amount: 1000, status: 'live', category: 'AI' },
    { id: 4, title: 'Small Fry', votes: 1, pledged_amount: 0, status: 'planned', category: 'Design' }
];

test('MarketInsider renders correctly with stats', () => {
    const handleClose = jest.fn();
    render(<MarketInsider features={mockFeatures} onClose={handleClose} />);

    // Check Header
    expect(screen.getByText('Market Insider')).toBeInTheDocument();

    // Check Market Volume
    expect(screen.getByText('$1,510')).toBeInTheDocument();

    // Check features appear. Since they might appear multiple times (Undervalued + Top Movers), we use getAllByText
    const gems = screen.getAllByText('Undervalued Gem');
    expect(gems.length).toBeGreaterThan(0);

    // Check Top Movers
    expect(screen.getByText('Big Mover')).toBeInTheDocument();
});
