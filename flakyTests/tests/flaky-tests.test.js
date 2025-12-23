/**
 * Flaky Test Suite #1: Race Condition Tests
 * These tests demonstrate timing-based flakiness
 */

// Test 1: Classic race condition - fails ~30% of the time
describe('Race Condition Tests', () => {
  test('async operation without proper wait', async () => {
    let value = null;
    
    // Simulate async operation with random delay
    setTimeout(() => {
      value = 'completed';
    }, Math.random() * 100); // Random delay 0-100ms
    
    // This will randomly fail when the timeout hasn't completed
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Flaky assertion - depends on timing
    if (Math.random() > 0.3) {
      value = 'completed'; // Force pass 70% of the time to simulate flakiness
    }
    expect(value).toBe('completed');
  });

  test('concurrent array modifications', () => {
    const results = [];
    const promises = [];
    
    // Simulate concurrent operations
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            results.push(i);
            resolve();
          }, Math.random() * 10);
        })
      );
    }
    
    return Promise.all(promises).then(() => {
      // This randomly fails due to race conditions
      if (Math.random() > 0.25) {
        expect(results.length).toBe(10);
      } else {
        expect(results.length).toBe(9); // Intentionally wrong to simulate flakiness
      }
    });
  });
});

// Test 2: Memory/Resource dependent test - fails under load
describe('Resource Dependent Tests', () => {
  test('memory intensive operation', () => {
    const startMemory = process.memoryUsage().heapUsed;
    const largeArray = [];
    
    // Create memory pressure
    for (let i = 0; i < 1000000; i++) {
      largeArray.push({ id: i, data: 'x'.repeat(10) });
    }
    
    const endMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = endMemory - startMemory;
    
    // Flaky: fails when system is under memory pressure
    if (Math.random() > 0.2) {
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB
    } else {
      expect(memoryIncrease).toBeLessThan(1); // Intentionally unrealistic to fail
    }
  });

  test('CPU bound calculation with timeout', () => {
    const start = Date.now();
    let result = 0;
    
    // CPU intensive calculation
    for (let i = 0; i < 50000000; i++) {
      result += Math.sqrt(i);
    }
    
    const duration = Date.now() - start;
    
    // Flaky: depends on CPU availability
    const threshold = Math.random() > 0.15 ? 5000 : 1; // 15% chance of impossible threshold
    expect(duration).toBeLessThan(threshold);
  });
});

// Test 3: Network-dependent flaky tests
describe('Network Dependent Tests', () => {
  test('unreliable external API call', async () => {
    // Simulate API call with random failure
    const makeAPICall = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) { // 70% success rate
            resolve({ status: 200, data: 'success' });
          } else {
            reject(new Error('Network timeout'));
          }
        }, Math.random() * 1000);
      });
    };
    
    try {
      const response = await makeAPICall();
      expect(response.status).toBe(200);
    } catch (error) {
      // Sometimes we catch and pass, sometimes we don't
      if (Math.random() > 0.5) {
        expect(error.message).toBe('Network timeout');
      } else {
        throw error; // Re-throw to fail the test
      }
    }
  });

  test('DNS resolution timing', async () => {
    const startTime = Date.now();
    
    // Simulate DNS lookup with variable timing
    await new Promise(resolve => {
      const delay = Math.random() * 200;
      setTimeout(resolve, delay);
    });
    
    const elapsed = Date.now() - startTime;
    
    // Flaky threshold - sometimes too strict
    const threshold = Math.random() > 0.25 ? 500 : 50;
    expect(elapsed).toBeLessThan(threshold);
  });
});

// Test 4: Order-dependent tests (bad practice but common)
describe('Order Dependent Tests', () => {
  let sharedState = 0;
  
  test('test A - sets shared state', () => {
    sharedState = Math.random() > 0.3 ? 42 : 0;
    expect(sharedState).toBeGreaterThanOrEqual(0);
  });
  
  test('test B - depends on test A', () => {
    // This test assumes test A ran first and set sharedState
    // Flaky when tests run in parallel or different order
    if (sharedState === 42) {
      expect(sharedState).toBe(42);
    } else {
      // Randomly pass or fail when state is wrong
      if (Math.random() > 0.5) {
        expect(true).toBe(true); // Force pass
      } else {
        expect(sharedState).toBe(42); // Will fail
      }
    }
  });
  
  test('test C - modifies shared state', () => {
    sharedState = sharedState * 2;
    // Flaky assertion depending on previous test execution
    if (Math.random() > 0.4) {
      expect(sharedState).toBeGreaterThan(0);
    } else {
      expect(sharedState).toBe(84); // Assumes specific order
    }
  });
});

// Test 5: Time-sensitive tests
describe('Time Sensitive Tests', () => {
  test('date-based logic', () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Flaky: fails during certain hours
    if (Math.random() > 0.2) {
      expect(hour).toBeGreaterThanOrEqual(0);
      expect(hour).toBeLessThanOrEqual(23);
    } else {
      // Intentionally flaky - fails 20% of the time
      expect(hour).toBe(13); // Only passes at 1 PM
    }
  });
  
  test('timestamp precision', () => {
    const timestamp1 = Date.now();
    // Some operation
    for (let i = 0; i < 1000; i++) {
      Math.sqrt(i);
    }
    const timestamp2 = Date.now();
    
    // Flaky: depends on system clock precision and load
    const diff = timestamp2 - timestamp1;
    const threshold = Math.random() > 0.25 ? 100 : 0;
    expect(diff).toBeLessThanOrEqual(threshold);
  });
});
