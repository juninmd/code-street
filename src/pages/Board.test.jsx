import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from './Board';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('canvas-confetti', () => jest.fn());
jest.mock('../utils/portfolio', () => ({
  addToPortfolio: jest.fn()
}));

// Mock child components to simplify testing
jest.mock('../components/MarketInsider', () => () => <div data-testid="market-insider" />);
jest.mock('../components/ShareBountyModal', () => () => <div data-testid="share-modal" />);
jest.mock('../components/MarketHeatmap', () => () => <div data-testid="market-heatmap" />);
jest.mock('../components/SniperMode', () => () => <div data-testid="sniper-mode" />);
jest.mock('../components/Sparkline', () => () => <div data-testid="sparkline" />);
jest.mock('../components/IPOLaunch', () => ({ feature, onClose }) => (
  <div data-testid="ipo-launch">
    IPO Launched: {feature.title}
    <button onClick={onClose} data-testid="close-ipo">Close</button>
  </div>
));

// Mock fetch
global.fetch = jest.fn();

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Board Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Default mock response for features and stats
    fetch.mockResolvedValue({
      json: async () => ({ data: [] }),
      ok: true
    });
  });

  test('renders Board and fetches data', async () => {
    await act(async () => {
      renderWithRouter(<Board />);
    });

    expect(screen.getByText('Market Overview')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalled();
  });

  test('opens IPO form when "File IPO" is clicked', async () => {
    await act(async () => {
      renderWithRouter(<Board />);
    });

    const fileBtn = screen.getByText('File IPO (S-1)');
    fireEvent.click(fileBtn);

    expect(screen.getByText('File IPO (S-1 Registration)')).toBeInTheDocument();
  });

  test('submitting IPO form triggers API and shows IPOLaunch modal', async () => {
    // Mock successful IPO creation response
    const newFeature = { id: 99, title: 'New IPO', category: 'frontend', votes: 0, pledged_amount: 0 };

    fetch.mockImplementation((url, options) => {
      if (url === '/api/features' && options?.method === 'POST') {
        return Promise.resolve({
          json: async () => ({ data: newFeature }),
          ok: true
        });
      }
      return Promise.resolve({
        json: async () => ({ data: [] }), // features list
        ok: true
      });
    });

    await act(async () => {
      renderWithRouter(<Board />);
    });

    // Open form
    fireEvent.click(screen.getByText('File IPO (S-1)'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('e.g. CodeStreet'), { target: { value: 'New IPO' } });
    fireEvent.change(screen.getByPlaceholderText('Definition of Done...'), { target: { value: 'Description' } });

    // Simulate datetime input (simplified)
    const deadlineInput = screen.getAllByRole('textbox').find(e => e.type === 'datetime-local') || screen.getByLabelText('Deadline');
    fireEvent.change(deadlineInput, { target: { value: '2025-12-31T23:59' } });

    // Submit
    const submitBtn = screen.getByText('List on Exchange');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(fetch).toHaveBeenCalledWith('/api/features', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('New IPO')
    }));

    // Check if IPOLaunch modal appears
    await waitFor(() => {
      expect(screen.getByTestId('ipo-launch')).toBeInTheDocument();
      expect(screen.getByText('IPO Launched: New IPO')).toBeInTheDocument();
    });
  });
});
