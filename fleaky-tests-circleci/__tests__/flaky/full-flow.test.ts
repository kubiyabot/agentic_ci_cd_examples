/**
 * Full integration flow test
 * ⚠️ SLOW & FLAKY TEST - Takes long time and sometimes times out
 */

import { createUser, clearUsers } from '@/lib/user-service';
import { processPayment } from '@/lib/payment-processor';

describe('Full Application Flow - SLOW & FLAKY', () => {
  beforeEach(() => {
    clearUsers();
  });

  it('should complete full user creation and payment flow', async () => {
    // This test is intentionally slow and flaky

    // Step 1: Create user (with artificial delay)
    await new Promise(resolve => setTimeout(resolve, 800));
    const userResult = createUser({
      email: 'customer@example.com',
      name: 'Paying Customer'
    });
    expect(userResult.success).toBe(true);

    // Step 2: Simulate some business logic (with random delay)
    const processingDelay = Math.random() * 1500; // 0-1500ms
    await new Promise(resolve => setTimeout(resolve, processingDelay));

    // Step 3: Process payment (with another delay)
    await new Promise(resolve => setTimeout(resolve, 600));
    const paymentResult = await processPayment({
      amount: 199.99,
      cardNumber: '4532015112830366',
      cardholderName: userResult.user!.name,
      expiryDate: '12/26',
      cvv: '456',
    });

    // Step 4: Verify everything (with final delay)
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.transactionId).toBeTruthy();

    // Total test time: 1900ms + random(0-1500ms) = 1.9-3.4 seconds
    // Sometimes exceeds Jest default timeout of 5s with other overhead
  }, 4000); // Tight timeout makes it flaky

  it('should handle multiple operations in sequence', async () => {
    // Create multiple users with delays
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400));
      createUser({
        email: `user${i}@example.com`,
        name: `User ${i}`
      });
    }

    // Process multiple payments with delays
    const paymentPromises = [];
    for (let i = 0; i < 3; i++) {
      const delayedPayment = async () => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 800));
        return processPayment({
          amount: 50 + i * 10,
          cardNumber: '5425233430109903',
          cardholderName: `User ${i}`,
          expiryDate: '03/27',
          cvv: '789',
        });
      };
      paymentPromises.push(delayedPayment());
    }

    const results = await Promise.all(paymentPromises);

    // Flaky assertion - sometimes timing causes issues
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  }, 5000);
});
