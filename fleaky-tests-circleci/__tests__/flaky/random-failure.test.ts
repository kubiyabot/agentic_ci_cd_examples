/**
 * Randomly failing test
 * ⚠️ EXTREMELY FLAKY - Fails approximately 30% of the time
 */

describe('Random Failure Tests - FLAKY', () => {
  it('should randomly fail based on probability', () => {
    // This test fails ~30% of the time
    const random = Math.random();

    if (random < 0.3) {
      // Simulate a flaky failure
      throw new Error(`Random flaky failure! (random value: ${random})`);
    }

    expect(true).toBe(true);
  });

  it('should fail on specific random seed ranges', () => {
    // Another type of random failure
    const randomValue = Math.floor(Math.random() * 100);

    // Fails when random value is in certain ranges
    if (randomValue < 25 || (randomValue > 70 && randomValue < 80)) {
      throw new Error(`Test failed due to unlucky random value: ${randomValue}`);
    }

    expect(randomValue).toBeGreaterThanOrEqual(0);
    expect(randomValue).toBeLessThan(100);
  });

  it('should have non-deterministic assertion', () => {
    // Generate a random number between 1 and 10
    const value = Math.floor(Math.random() * 10) + 1;

    // This assertion is flaky - sometimes value will be <= 7
    expect(value).toBeGreaterThan(7);
  });

  it('should fail intermittently with async operations', async () => {
    // Simulate an async operation with random outcome
    const result = await new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Randomly resolve with true or false
        resolve(Math.random() > 0.25); // 75% success rate
      }, 100);
    });

    // This will fail 25% of the time
    expect(result).toBe(true);
  });
});
