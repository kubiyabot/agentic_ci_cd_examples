/**
 * Deterministic Test Setup
 * This file provides utilities to make tests deterministic and eliminate flaky patterns
 */

// Seed for deterministic random generation
let randomSeed = 12345;

/**
 * Deterministic random number generator using Linear Congruential Generator
 * Provides consistent "random" values for testing
 */
function deterministicRandom() {
  randomSeed = (randomSeed * 9301 + 49297) % 233280;
  return randomSeed / 233280;
}

/**
 * Mock Math.random globally for deterministic behavior
 */
export function mockMathRandom() {
  const originalRandom = Math.random;
  Math.random = jest.fn(() => deterministicRandom());
  return () => {
    Math.random = originalRandom;
  };
}

/**
 * Mock Date for time-sensitive tests
 */
export function mockDate(fixedDate = '2024-01-15T10:00:00.000Z') {
  const mockDate = new Date(fixedDate);
  const originalDate = global.Date;

  global.Date = jest.fn(() => mockDate);
  global.Date.now = jest.fn(() => mockDate.getTime());
  global.Date.UTC = originalDate.UTC;
  global.Date.parse = originalDate.parse;

  return () => {
    global.Date = originalDate;
  };
}

/**
 * Mock process.memoryUsage for consistent memory tests
 */
export function mockMemoryUsage() {
  const originalMemoryUsage = process.memoryUsage;
  process.memoryUsage = jest.fn(() => ({
    rss: 50 * 1024 * 1024,        // 50MB
    heapTotal: 30 * 1024 * 1024,  // 30MB
    heapUsed: 20 * 1024 * 1024,   // 20MB
    external: 1 * 1024 * 1024,    // 1MB
    arrayBuffers: 0
  }));

  return () => {
    process.memoryUsage = originalMemoryUsage;
  };
}

/**
 * Create deterministic delay promise
 */
export function deterministicDelay(ms) {
  return new Promise(resolve => {
    // Use setImmediate for immediate resolution in tests
    setImmediate(resolve);
  });
}

/**
 * Mock fetch for network-dependent tests
 */
export function mockNetworkCalls() {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Default successful response
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ data: 'success', timestamp: Date.now() }),
    text: async () => 'success',
    headers: new Map([['content-type', 'application/json']])
  });

  return {
    mockFetch,
    setResponse: (response) => mockFetch.mockResolvedValueOnce(response),
    setError: (error) => mockFetch.mockRejectedValueOnce(error),
    reset: () => mockFetch.mockClear()
  };
}

/**
 * Create isolated test context to prevent state leakage
 */
export class TestContext {
  constructor() {
    this.state = new Map();
    this.cleanup = [];
  }

  set(key, value) {
    this.state.set(key, value);
  }

  get(key) {
    return this.state.get(key);
  }

  addCleanup(fn) {
    this.cleanup.push(fn);
  }

  destroy() {
    this.cleanup.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    this.state.clear();
    this.cleanup = [];
  }
}

/**
 * Performance monitoring for tests
 */
export class TestPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  start(testName) {
    this.metrics.set(testName, {
      startTime: process.hrtime.bigint(),
      memoryStart: process.memoryUsage()
    });
  }

  end(testName) {
    const metric = this.metrics.get(testName);
    if (!metric) return null;

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - metric.startTime) / 1000000; // Convert to ms

    return {
      duration,
      memoryDelta: this.calculateMemoryDelta(metric.memoryStart, process.memoryUsage())
    };
  }

  calculateMemoryDelta(start, end) {
    return {
      rss: end.rss - start.rss,
      heapTotal: end.heapTotal - start.heapTotal,
      heapUsed: end.heapUsed - start.heapUsed
    };
  }
}

/**
 * Retry mechanism for handling occasional failures
 */
export async function retryTest(testFn, maxRetries = 3, delay = 100) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await testFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Test failed after ${maxRetries} attempts. Last error: ${error.message}`);
      }
      await deterministicDelay(delay * attempt);
    }
  }
}

/**
 * Global test environment setup
 */
export function setupDeterministicTestEnvironment() {
  const restoreMathRandom = mockMathRandom();
  const restoreDate = mockDate();
  const restoreMemoryUsage = mockMemoryUsage();
  const { reset: resetFetch } = mockNetworkCalls();

  // Global timeout override
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = jest.fn((callback, delay = 0) => {
    // Make all timeouts immediate in tests
    return setImmediate(callback);
  });

  return () => {
    restoreMathRandom();
    restoreDate();
    restoreMemoryUsage();
    resetFetch();
    global.setTimeout = originalSetTimeout;
  };
}

/**
 * Test data factory for consistent test data
 */
export class TestDataFactory {
  static createUser(id = 1) {
    return {
      id,
      name: `Test User ${id}`,
      email: `user${id}@example.com`,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      settings: {
        theme: 'light',
        notifications: true
      }
    };
  }

  static createApiResponse(data = null, status = 200) {
    return {
      status,
      ok: status >= 200 && status < 300,
      data: data || { success: true, timestamp: Date.now() },
      headers: { 'content-type': 'application/json' }
    };
  }

  static createErrorResponse(message = 'Test error', status = 500) {
    return {
      status,
      ok: false,
      error: { message, code: status },
      headers: { 'content-type': 'application/json' }
    };
  }
}