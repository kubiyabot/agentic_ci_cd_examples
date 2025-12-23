/**
 * Jest Setup File
 * Configures global test environment for reliable, non-flaky testing
 */

// =========================
// GLOBAL MOCKS FOR DETERMINISTIC TESTING
// =========================

// Mock Math.random for deterministic tests
const originalMathRandom = Math.random;
let isRandomMocked = false;

global.mockMathRandom = (value = 0.5) => {
  if (!isRandomMocked) {
    Math.random = jest.fn(() => value);
    isRandomMocked = true;
  } else {
    Math.random.mockReturnValue(value);
  }
};

global.restoreMathRandom = () => {
  if (isRandomMocked) {
    Math.random = originalMathRandom;
    isRandomMocked = false;
  }
};

// Mock Date for time-sensitive tests
const originalDate = Date;
let isDateMocked = false;

global.mockDate = (dateString = '2024-01-15T10:00:00Z') => {
  const mockDate = new Date(dateString);
  if (!isDateMocked) {
    global.Date = jest.fn(() => mockDate);
    global.Date.now = jest.fn(() => mockDate.getTime());
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    isDateMocked = true;
  }
};

global.restoreDate = () => {
  if (isDateMocked) {
    global.Date = originalDate;
    isDateMocked = false;
  }
};

// Mock setTimeout/setInterval for controlled timing
let isTimerMocked = false;

global.mockTimers = () => {
  if (!isTimerMocked) {
    jest.useFakeTimers();
    isTimerMocked = true;
  }
};

global.restoreTimers = () => {
  if (isTimerMocked) {
    jest.useRealTimers();
    isTimerMocked = false;
  }
};

// =========================
// GLOBAL TEST UTILITIES
// =========================

// Helper function to create deterministic test data
global.createTestData = (type, count = 3) => {
  const generators = {
    users: (i) => ({ id: i, name: `Test User ${i}`, email: `user${i}@example.com` }),
    products: (i) => ({ id: i, name: `Product ${i}`, price: i * 10.99 }),
    orders: (i) => ({ id: i, userId: i, total: i * 25.50, status: 'completed' })
  };

  if (!generators[type]) {
    throw new Error(`Unknown test data type: ${type}`);
  }

  return Array.from({ length: count }, (_, i) => generators[type](i + 1));
};

// Helper for async test operations
global.createControlledPromise = (resolveValue, delay = 0) => {
  if (delay === 0) {
    return Promise.resolve(resolveValue);
  }
  return new Promise(resolve => {
    setTimeout(() => resolve(resolveValue), delay);
  });
};

// Helper for testing error conditions
global.createControlledError = (message, delay = 0) => {
  const error = new Error(message);
  if (delay === 0) {
    return Promise.reject(error);
  }
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

// =========================
// TEST ISOLATION HELPERS
// =========================

// Ensure clean state between tests
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Reset timers if they were mocked
  if (isTimerMocked) {
    jest.clearAllTimers();
  }

  // Restore original implementations
  restoreMathRandom();
  restoreDate();
  restoreTimers();
});

afterEach(() => {
  // Additional cleanup
  jest.resetModules();
});

// =========================
// PERFORMANCE MONITORING
// =========================

let testStartTime;
const slowTestThreshold = 1000; // 1 second

beforeEach(() => {
  testStartTime = Date.now();
});

afterEach(() => {
  const testDuration = Date.now() - testStartTime;
  if (testDuration > slowTestThreshold) {
    console.warn(`⚠️  Slow test detected: ${expect.getState().currentTestName} took ${testDuration}ms`);
  }
});

// =========================
// ENVIRONMENT CONFIGURATION
// =========================

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Configure global timeouts
const DEFAULT_TEST_TIMEOUT = 5000;
jest.setTimeout(DEFAULT_TEST_TIMEOUT);

// =========================
// FLAKY TEST DETECTION
// =========================

let testResults = [];

global.trackTestResult = (testName, status, duration) => {
  testResults.push({
    name: testName,
    status,
    duration,
    timestamp: Date.now()
  });
};

global.getTestResults = () => testResults;
global.clearTestResults = () => { testResults = []; };

// =========================
// CUSTOM MATCHERS
// =========================

// Add custom Jest matchers for better assertions
expect.extend({
  toBeWithinTimeLimit(received, limit) {
    const pass = received <= limit;
    return {
      message: () =>
        `expected ${received}ms to be ${pass ? 'not ' : ''}within ${limit}ms`,
      pass,
    };
  },

  toHaveStableResult(testFunction, iterations = 10) {
    const results = [];
    for (let i = 0; i < iterations; i++) {
      try {
        results.push(testFunction());
      } catch (error) {
        results.push(error);
      }
    }

    const firstResult = results[0];
    const allSame = results.every(result => {
      if (firstResult instanceof Error && result instanceof Error) {
        return firstResult.message === result.message;
      }
      return firstResult === result;
    });

    return {
      message: () =>
        `expected test function to have stable results across ${iterations} iterations`,
      pass: allSame,
    };
  }
});

console.log('✅ Jest setup complete - deterministic test environment ready');