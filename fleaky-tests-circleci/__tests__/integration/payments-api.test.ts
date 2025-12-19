/**
 * Integration test for payments API
 * ⚠️ FLAKY TEST - Has timing issues and occasionally times out
 */

import { processPayment } from '@/lib/payment-processor';

describe('Payments API Integration - FLAKY TEST', () => {
  it('should process payment with realistic delay', async () => {
    // Simulate network delay - sometimes exceeds Jest timeout
    const randomDelay = Math.random() * 2500; // 0-2500ms delay
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    const result = await processPayment({
      amount: 50.00,
      cardNumber: '4532015112830366',
      cardholderName: 'Test User',
      expiryDate: '12/25',
      cvv: '123',
    });

    expect(result.success).toBe(true);
  }, 3000); // 3 second timeout - sometimes not enough!

  it('should handle concurrent payment requests', async () => {
    // This test is flaky because of race conditions
    const payment = {
      amount: 25.00,
      cardNumber: '4532015112830366',
      cardholderName: 'Test User',
      expiryDate: '12/25',
      cvv: '123',
    };

    // Simulate concurrent requests
    const promises = Array(5).fill(null).map(() => {
      const delay = Math.random() * 1000;
      return new Promise(resolve =>
        setTimeout(() => resolve(processPayment(payment)), delay)
      );
    });

    const results = await Promise.all(promises);

    // Sometimes this assertion fails due to timing
    results.forEach((result: any) => {
      expect(result.success).toBe(true);
    });
  }, 5000);
});
