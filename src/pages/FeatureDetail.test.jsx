import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FeatureDetail from './FeatureDetail';

jest.mock('canvas-confetti', () => jest.fn());
jest.mock('../components/PriceChart', () => () => <div data-testid="price-chart" />);
jest.mock('../components/AnalystRating', () => () => <div />);
jest.mock('../components/OptionsChain', () => () => <div />);
jest.mock('../components/ShareBountyModal', () => () => <div />);
jest.mock('../components/PaymentModal', () => () => <div />);
jest.mock('../components/HackerLeakModal', () => () => <div />);

const feature = { id: 1, title: 'Dark Mode', ticker: 'DARK', status: 'open', votes: 0, pledged_amount: 0, category: 'ui' };

const reply = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: async () => body });

function mockApi(commentReply) {
    global.fetch = jest.fn((url, opts) => {
        if (opts?.method === 'POST' && url.endsWith('/comments')) return commentReply();
        if (url === '/api/features') return reply({ data: [feature] });
        return reply({ data: [] });
    });
}

const renderPage = () => render(
    <MemoryRouter initialEntries={['/feature/1']}>
        <Routes>
            <Route path="/feature/:id" element={<FeatureDetail />} />
        </Routes>
    </MemoryRouter>
);

async function postComment(text) {
    const box = await screen.findByPlaceholderText(/Ask questions/);
    fireEvent.change(box, { target: { value: text } });
    fireEvent.submit(box.closest('form'));
    return box;
}

describe('FeatureDetail comments', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    it('keeps the page and the draft when the server rejects a comment', async () => {
        mockApi(() => reply({ error: 'FOREIGN KEY constraint failed' }, false, 400));
        renderPage();

        const box = await postComment('Ship it');

        await waitFor(() => expect(screen.getByText(/Comment not posted/)).toBeInTheDocument());
        expect(screen.getByText('Comments (0)')).toBeInTheDocument();
        expect(box).toHaveValue('Ship it');
    });

    it('appends the comment the server saved', async () => {
        mockApi(() => reply({ data: { id: 7, content: 'Ship it', created_at: null } }));
        renderPage();

        const box = await postComment('Ship it');

        expect(await screen.findByText('Ship it', { selector: 'p' })).toBeInTheDocument();
        expect(screen.getByText('Comments (1)')).toBeInTheDocument();
        expect(box).toHaveValue('');
    });
});
