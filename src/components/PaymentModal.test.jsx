import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PaymentModal from './PaymentModal';

jest.useFakeTimers();

describe('PaymentModal', () => {
  it('renders the payment summary correctly', () => {
    const amount = 100;
    const fee = amount * 0.05;
    const total = amount + fee;

    render(<PaymentModal amount={amount} onConfirm={() => {}} onClose={() => {}} />);

    expect(screen.getByText(`$${amount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`$${fee.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`$${total.toFixed(2)}`)).toBeInTheDocument();
  });

  it('handles payment submission flow', async () => {
    const onConfirm = jest.fn();
    render(<PaymentModal amount={100} onConfirm={onConfirm} onClose={() => {}} />);

    // Fill out required fields
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '4242424242424242' } }); // Card
    fireEvent.change(inputs[1], { target: { value: '12/25' } }); // Expiry
    fireEvent.change(inputs[2], { target: { value: '123' } }); // CVC

    const payButton = screen.getByText('Pay $105.00');
    fireEvent.click(payButton);

    expect(screen.getByText('Processing Transaction...')).toBeInTheDocument();

    // Fast-forward processing delay
    act(() => {
        jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Payment Successful')).toBeInTheDocument();

    // Fast-forward auto-close delay
    act(() => {
        jest.advanceTimersByTime(1500);
    });

    expect(onConfirm).toHaveBeenCalled();
  });
});
