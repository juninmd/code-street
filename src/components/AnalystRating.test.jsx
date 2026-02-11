import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalystRating from './AnalystRating';

describe('AnalystRating Component', () => {
  const mockProps = {
    title: 'Test Feature',
    description: 'This is a test feature description.',
    currentPrice: 100
  };

  test('renders analyst rating component', () => {
    render(<AnalystRating {...mockProps} />);
    expect(screen.getByText('Wall St. Analyst Report')).toBeInTheDocument();
    expect(screen.getByText('Risk Profile')).toBeInTheDocument();
    expect(screen.getByText('Target Price')).toBeInTheDocument();
  });

  test('renders consistent rating for same input', () => {
    const { rerender } = render(<AnalystRating {...mockProps} />);
    const firstRating = screen.getByText(/STRONG BUY|BUY|HOLD|SELL|STRONG SELL/i).textContent;

    rerender(<AnalystRating {...mockProps} />);
    const secondRating = screen.getByText(/STRONG BUY|BUY|HOLD|SELL|STRONG SELL/i).textContent;

    expect(firstRating).toBe(secondRating);
  });

  test('renders nothing if props are missing', () => {
    const { container } = render(<AnalystRating title="" description="" />);
    expect(container.firstChild).toBeNull();
  });

  test('calculates target price correctly', () => {
      render(<AnalystRating {...mockProps} />);
      // Target price should be visible and formatted with $
      const targetPriceElements = screen.getAllByText(/\$\d+/);
      expect(targetPriceElements.length).toBeGreaterThan(0);
  });
});
