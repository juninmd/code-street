import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import IPOLaunch from './IPOLaunch';

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn());

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Rocket: () => <div data-testid="rocket-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="close-icon" />
}));

describe('IPOLaunch Component', () => {
  const mockFeature = {
    title: 'Test Feature',
    ticker: 'TEST',
    pledged_amount: 50
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders successfully with feature details', () => {
    render(<IPOLaunch feature={mockFeature} onClose={mockOnClose} />);

    expect(screen.getByText('IPO Successful!')).toBeInTheDocument();
    expect(screen.getByText(/TEST is now live/)).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument(); // 50 * 100
  });

  test('calls onClose when close button is clicked', () => {
    render(<IPOLaunch feature={mockFeature} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('close-icon').parentElement;
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('share button triggers navigator.share or alert', async () => {
    // Mock navigator.clipboard
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    // Mock window.alert
    window.alert = jest.fn();

    render(<IPOLaunch feature={mockFeature} onClose={mockOnClose} />);

    // Fast-forward or just find the button (it might be hidden initially by opacity but still clickable in DOM)
    const shareBtn = screen.getByText('Share Prospectus');

    await act(async () => {
      fireEvent.click(shareBtn);
    });

    // Check if fallback to clipboard was called (since navigator.share is undefined in JSDOM usually)
    expect(mockWriteText).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });
});
