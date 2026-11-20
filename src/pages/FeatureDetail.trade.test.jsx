import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FeatureDetail from './FeatureDetail';

jest.mock('canvas-confetti', () => jest.fn());
jest.mock('../utils/portfolio', () => ({ addToPortfolio: jest.fn() }));
jest.mock('../components/PriceChart', () => () => <div />);
jest.mock('../components/AnalystRating', () => () => <div />);
jest.mock('../components/OptionsChain', () => () => <div />);
jest.mock('../components/ShareBountyModal', () => () => <div />);
jest.mock('../components/HackerLeakModal', () => () => <div />);
// The real modal flips to a close-less "Payment Successful" screen before calling onConfirm.
jest.mock('../components/PaymentModal', () => ({ onConfirm }) => (
    <div role="dialog">
        Payment Successful
        <button onClick={() => onConfirm(false)}>confirm</button>
    </div>
));

const feature = { id: 1, title: 'Dark Mode', ticker: 'DARK', status: 'open', votes: 0, pledged_amount: 0, current_price: 1 };
const reply = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: async () => body });

function mockApi(tradeReply) {
    global.fetch = jest.fn((url, opts) => {
        if (opts?.method === 'POST') return tradeReply();
        if (url === '/api/features') return reply({ data: [feature] });
        return reply({ data: [] });
    });
}

async function trade(button) {
    render(
        <MemoryRouter initialEntries={['/feature/1']}>
            <Routes>
                <Route path="/feature/:id" element={<FeatureDetail />} />
            </Routes>
        </MemoryRouter>
    );
    fireEvent.change(await screen.findByPlaceholderText('0.00'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: button }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm' }));
}

describe('FeatureDetail trades', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Toasts are appended straight to <body>, outside the React tree that cleanup unmounts
    afterEach(() => { document.body.innerHTML = ''; });

    it.each(['Buy Shares', 'Short Sell'])('%s rejected by the server closes the modal and says so', async (button) => {
        mockApi(() => reply({ error: 'Valid amount is required' }, false, 400));
        await trade(button);

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(screen.getByText(/Order not filled/)).toBeInTheDocument();
    });

    it('a filled order still closes the modal without the failure toast', async () => {
        mockApi(() => reply({ message: 'ok' }));
        await trade('Buy Shares');

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(screen.queryByText(/Order not filled/)).not.toBeInTheDocument();
    });
});
