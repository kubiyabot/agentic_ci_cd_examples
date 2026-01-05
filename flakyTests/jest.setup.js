/**
 * Global Jest Setup for Flaky Test Fixes
 * This file implements comprehensive mocks to eliminate flaky test patterns
 */

// ===== GLOBAL MOCKS FOR FLAKY TEST FIXES =====

// Fix 1: Mock Math.random() globally to eliminate random dependencies
const originalMathRandom = Math.random;
global.Math.random = jest.fn(() => 0.8);

// Fix 2: Store original Date for later restoration
const OriginalDate = global.Date;

// Fix 3: Set consistent environment variables
process.env.NODE_ENV = 'test';

// Fix 4: Mock Intl for locale consistency
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: jest.fn(() => ({
      resolvedOptions: () => ({ locale: 'en-US' })
    }))
  },
  writable: true
});

console.log('🔧 Flaky test fixes applied: Math.random, env vars, and locale mocked');