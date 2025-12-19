/**
 * Unit tests for payment processor
 * These tests are STABLE and should always pass
 */

import {
  validateCardNumber,
  validateAmount,
  validateCVV,
  processPayment,
  PaymentRequest,
} from '@/lib/payment-processor';

describe('Payment Processor - STABLE TESTS', () => {
  describe('validateCardNumber', () => {
    it('should validate correct card numbers', () => {
      expect(validateCardNumber('4532015112830366')).toBe(true); // Valid Visa
      expect(validateCardNumber('5425233430109903')).toBe(true); // Valid Mastercard
      expect(validateCardNumber('4532 0151 1283 0366')).toBe(true); // With spaces
    });

    it('should reject invalid card numbers', () => {
      expect(validateCardNumber('1234567890123456')).toBe(false);
      expect(validateCardNumber('invalid')).toBe(false);
      expect(validateCardNumber('123')).toBe(false);
      expect(validateCardNumber('')).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should validate correct amounts', () => {
      expect(validateAmount(10.50)).toBe(true);
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(9999.99)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-50)).toBe(false);
      expect(validateAmount(10001)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
    });
  });

  describe('validateCVV', () => {
    it('should validate correct CVV codes', () => {
      expect(validateCVV('123')).toBe(true);
      expect(validateCVV('9876')).toBe(true);
    });

    it('should reject invalid CVV codes', () => {
      expect(validateCVV('12')).toBe(false);
      expect(validateCVV('12345')).toBe(false);
      expect(validateCVV('abc')).toBe(false);
      expect(validateCVV('')).toBe(false);
    });
  });

  describe('processPayment', () => {
    const validPayment: PaymentRequest = {
      amount: 99.99,
      cardNumber: '4532015112830366',
      cardholderName: 'John Doe',
      expiryDate: '12/25',
      cvv: '123',
    };

    it('should process valid payment successfully', async () => {
      const result = await processPayment(validPayment);
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeTruthy();
      expect(result.message).toBe('Payment processed successfully');
      expect(result.amount).toContain('99.99');
    });

    it('should reject payment with invalid amount', async () => {
      const payment = { ...validPayment, amount: -50 };
      const result = await processPayment(payment);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid payment amount');
    });

    it('should reject payment with invalid card', async () => {
      const payment = { ...validPayment, cardNumber: '1234567890123456' };
      const result = await processPayment(payment);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid card number');
    });

    it('should reject payment with invalid CVV', async () => {
      const payment = { ...validPayment, cvv: '12' };
      const result = await processPayment(payment);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid CVV');
    });

    it('should reject payment without cardholder name', async () => {
      const payment = { ...validPayment, cardholderName: '' };
      const result = await processPayment(payment);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cardholder name is required');
    });
  });
});
