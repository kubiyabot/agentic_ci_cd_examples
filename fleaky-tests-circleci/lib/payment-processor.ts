/**
 * Payment Processing Module
 * Handles payment validation and processing logic
 */

import { formatCurrency } from './utils';

export interface PaymentRequest {
  amount: number;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  amount?: string;
}

/**
 * Validates a credit card number using Luhn algorithm
 * @param cardNumber - The card number to validate
 * @returns True if valid
 */
export function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validates payment amount
 * @param amount - The amount to validate
 * @returns True if valid amount
 */
export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000 && Number.isFinite(amount);
}

/**
 * Validates CVV code
 * @param cvv - The CVV to validate
 * @returns True if valid CVV
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Processes a payment request
 * @param payment - The payment request to process
 * @returns Payment result
 */
export async function processPayment(payment: PaymentRequest): Promise<PaymentResult> {
  if (!validateAmount(payment.amount)) {
    return {
      success: false,
      message: 'Invalid payment amount. Must be between $0.01 and $10,000.',
    };
  }

  if (!validateCardNumber(payment.cardNumber)) {
    return {
      success: false,
      message: 'Invalid card number.',
    };
  }

  if (!validateCVV(payment.cvv)) {
    return {
      success: false,
      message: 'Invalid CVV code.',
    };
  }

  if (!payment.cardholderName || payment.cardholderName.trim().length === 0) {
    return {
      success: false,
      message: 'Cardholder name is required.',
    };
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    success: true,
    transactionId,
    message: 'Payment processed successfully',
    amount: formatCurrency(payment.amount),
  };
}
