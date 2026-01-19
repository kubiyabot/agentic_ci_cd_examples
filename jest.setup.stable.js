/**
 * Jest Setup for Stable Tests
 * Ensures all tests run with proper mocking and isolation
 */

// Increase timeout for all tests (but stable tests should be fast)
jest.setTimeout(5000);

// Mock console methods to reduce noise (optional)
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Set default timezone to UTC for consistency
process.env.TZ = 'UTC';

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  /**
   * Create a mock date for testing
   */
  createMockDate: (dateString = '2024-03-15T10:00:00Z') => {
    return new Date(dateString);
  },
  
  /**
   * Create deterministic test data
   */
  createTestData: (count = 10) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Test Item ${i}`,
      value: i * 10
    }));
  },
  
  /**
   * Wait for a specific amount of time (use with fake timers)
   */
  advanceTime: async (ms) => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve(); // Flush promises
  }
};

// Global beforeEach - runs before every test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset modules to ensure clean state
  // jest.resetModules(); // Uncomment if needed
});

// Global afterEach - runs after every test
afterEach(() => {
  // Restore all mocks
  jest.restoreAllMocks();
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Use real timers after each test
  if (jest.isMockFunction(setTimeout)) {
    jest.useRealTimers();
  }
});

// Suppress specific warnings if needed
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress React deprecation warnings, etc.
    if (message.includes('deprecated')) {
      return;
    }
  }
  originalWarn(...args);
};

// Add custom matchers if needed
expect.extend({
  /**
   * Check if a value is within a range
   */
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },
  
  /**
   * Check if a date is valid
   */
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false
      };
    }
  }
});

// Log test environment info
console.log('🧪 Stable Test Environment Initialized');
console.log(`   TZ: ${process.env.TZ}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Jest Timeout: ${jest.getTimerCount ? 'Fake Timers Active' : 'Real Timers'}`);
